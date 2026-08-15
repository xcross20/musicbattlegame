import os
import json
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from ytmusicapi import YTMusic
from openai import OpenAI

DIST_DIR = os.path.join(os.path.dirname(__file__), "..", "dist")

app = Flask(__name__, static_folder=DIST_DIR, static_url_path="")
CORS(app)

yt = YTMusic()

# the newest OpenAI model is "gpt-5" which was released August 7, 2025.
# do not change this unless explicitly requested by the user
AI_INTEGRATIONS_OPENAI_API_KEY = os.environ.get("AI_INTEGRATIONS_OPENAI_API_KEY")
AI_INTEGRATIONS_OPENAI_BASE_URL = os.environ.get("AI_INTEGRATIONS_OPENAI_BASE_URL")

openai_client = None
if AI_INTEGRATIONS_OPENAI_API_KEY and AI_INTEGRATIONS_OPENAI_BASE_URL:
    openai_client = OpenAI(
        api_key=AI_INTEGRATIONS_OPENAI_API_KEY,
        base_url=AI_INTEGRATIONS_OPENAI_BASE_URL
    )


@app.route("/api/search", methods=["GET"])
def search_songs():
    query = request.args.get("q", "")
    if not query:
        return jsonify([])

    try:
        results = yt.search(query, filter="songs", limit=8)
        mapped = []
        for item in results:
            video_id = item.get("videoId", "")
            title = item.get("title", "")
            artists = ", ".join(a.get("name", "") for a in item.get("artists", []))
            display_title = f"{title} - {artists}" if artists else title
            thumbnails = item.get("thumbnails", [])
            thumb_url = thumbnails[-1]["url"] if thumbnails else ""

            mapped.append({
                "videoId": video_id,
                "title": display_title,
                "thumbnail": thumb_url,
            })
        return jsonify(mapped)
    except Exception as e:
        print(f"Search error: {e}")
        return jsonify([])


@app.route("/api/ai-judge", methods=["POST"])
def ai_judge():
    if not openai_client:
        return jsonify({"error": "AI judge not available"}), 503

    data = request.get_json()
    category = data.get("category", "")
    song1 = data.get("song1", "")
    song2 = data.get("song2", "")
    player1_name = data.get("player1Name", "Player 1")
    player2_name = data.get("player2Name", "Player 2")

    if not category or not song1 or not song2:
        return jsonify({"error": "Missing category or songs"}), 400

    prompt = f"""You are the AI Judge for a Song Battle Royale game. Two players have each picked a song for the category "{category}".

{player1_name}'s pick: "{song1}"
{player2_name}'s pick: "{song2}"

STEP 1 — IDENTIFY CATEGORY TYPE:
Determine which type this category falls into:

A) ERA + GENRE (e.g. "00's R&B (2000-2010)", "90's Hits", "80's Hits", "00's Hip Hop (2000-2010)", "00's Rock (2000-2010)", "00's Pop (2000-2010)", "00's Country (2000-2010)", "2010's Hits", "70's Hits"):
   - Check 1 (ERA): Was this song released in the correct decade? Be precise about release year.
   - Check 2 (GENRE): Does the song fit the genre or a closely associated sub-genre?
     * "R&B" includes: R&B, neo-soul, contemporary R&B, quiet storm, new jack swing
     * "Hip Hop" includes: hip hop, rap, crunk, snap, trap, boom bap, conscious rap
     * "Rock" includes: rock, alternative, indie rock, punk, grunge, hard rock, pop-rock
     * "Pop" includes: pop, dance-pop, synth-pop, electropop, teen pop
     * "Country" includes: country, country pop, country rock, outlaw country, americana
     * "Hits" (decade only) = any genre, just must be from that decade
   - SCORING: Both checks pass = 25-40 relevancy. One check fails = 10-20 relevancy. Both fail = 0-5.

B) REGIONAL (e.g. "Atlanta Rap", "East Coast Hip Hop", "West Coast Hip Hop", "Chicago Rap"):
   - Is the artist from or closely associated with this region?
   - Does the sound match the regional style?
   - Artists who have strong ties to a region (lived there, came up there, rep it) count even if born elsewhere.

C) MOOD / VIBE (e.g. "Party", "Workout", "Baby Making Songs", "Break Up", "Love", "Cheating", "Motivation", "Smoking Songs", "Hype Myself Songs (Boss Energy)", "Summer", "Dance Songs", "Booty Clapping", "I'm the Ish Songs", "White Girl Rocks", "Black Girl Bops"):
   - Judge by the song's ENERGY, MOOD, TEMPO, and VIBE — not strict genre.
   - "Party" = bangers people dance to at parties, crowd singalongs, high energy
   - "Workout" = high BPM, aggressive energy, pump-up anthems (e.g. "Lose Yourself", "Till I Collapse", "Power" by Kanye)
   - "Baby Making Songs" = slow, sensual, intimate mood music (e.g. "Take You Down" by Chris Brown, "Nobody" by Keith Sweat, "Adorn" by Miguel)
   - "Break Up" = heartbreak, moving on, emotional release (e.g. "Irreplaceable" by Beyonce, "So Sick" by Ne-Yo, "We Are Never Getting Back Together")
   - "Love" = romantic love songs of any genre
   - "Cheating" = songs about infidelity from any perspective
   - "Motivation" = inspirational, keep-pushing anthems (e.g. "Eye of the Tiger", "Hustlin" by Rick Ross, "Started from the Bottom")
   - "Smoking Songs" = laid-back, chill vibes (e.g. "Roll Up" by Wiz Khalifa, "Because I Got High" by Afroman, "How High" by Method Man)
   - "Hype Myself Songs (Boss Energy)" = self-confidence anthems (e.g. "Nonstop" by Drake, "I'm Different" by 2 Chainz, "Did It On Em" by Nicki Minaj)
   - "I'm the Ish Songs" = swagger and self-hype (e.g. "Win" by Jay Rock, "Grindin All My Life" by Nipsey Hussle, "All I Do Is Win" by DJ Khaled)
   - "Summer" = feel-good warm weather anthems
   - "Dance Songs" = songs with actual dances/routines (e.g. "Lean Wit It Rock Wit It", "Walk It Out", "Crank That", "Cupid Shuffle")
   - "Booty Clapping" = twerk/bounce music, bass-heavy
   - "White Girl Rocks" = songs white girls go crazy for at parties/clubs
   - "Black Girl Bops" = songs Black women love and anthem to
   - These categories are VERY flexible on genre — a country song CAN be a party song, an R&B song CAN be a workout song. Judge the VIBE.

D) GENRE-ONLY (e.g. "Gangster Rap", "Emo Rap", "Latin", "Afrobeats", "Gospel", "Worship", "Jazz", "Motown", "Funk / Disco", "Soul Ballads", "Country Pop", "Pop Songs"):
   - "Gangster Rap" = street life, hustling themes (e.g. "Nuthin but a G Thang", "Regulate", "Still D.R.E.")
   - "Emo Rap" = emotional/introspective rap, often melodic (e.g. "Lucid Dreams" by Juice WRLD, "XO Tour Llif3" by Lil Uzi Vert, "Sad!" by XXXTentacion)
   - "Latin" = Latin music including reggaeton, salsa, bachata, Latin pop (e.g. "Despacito", "Vivir Mi Vida", "Bailando")
   - "Afrobeats" = West African pop music (e.g. "Peru" by Fireboy DML, "Essence" by Wizkid, "Last Last" by Burna Boy)
   - "Gospel" = gospel music (e.g. "Amazing Grace", "I Can Only Imagine", "Oh Happy Day")
   - "Worship" = contemporary worship music (e.g. "Oceans" by Hillsong, "How Great Is Our God", "Reckless Love")
   - "Jazz" = jazz standards, jazz fusion, smooth jazz (e.g. "Take Five", "So What" by Miles Davis, "Fly Me to the Moon")
   - "Motown" = Motown Records era soul (e.g. "Ain't No Mountain High Enough", "I Heard It Through the Grapevine", "My Girl")
   - "Funk / Disco" = funk or disco (e.g. "Good Times" by Chic, "Stayin' Alive", "Superstition" by Stevie Wonder)
   - "Soul Ballads" = soulful slow songs (e.g. "At Last" by Etta James, "A Change Is Gonna Come" by Sam Cooke)
   - "Country Pop" = country with pop crossover appeal (e.g. "Man! I Feel Like a Woman!" by Shania Twain, "Before He Cheats" by Carrie Underwood)
   - Accept songs in the genre OR closely related sub-genres.

E) SPECIAL (e.g. "Movie Songs", "Broadway Songs", "Christmas", "Patriotic Songs", "Group Songs"):
   - "Movie Songs" = featured prominently in a movie soundtrack (e.g. "My Heart Will Go On", "Skyfall", "Lose Yourself" from 8 Mile)
   - "Broadway Songs" = from a musical theater production (e.g. "Defying Gravity", "My Shot", "Memory")
   - "Christmas" = Christmas/holiday songs (e.g. "All I Want for Christmas Is You", "Last Christmas", "Jingle Bell Rock")
   - "Patriotic Songs" = patriotic themes (e.g. "God Bless the USA", "Born in the U.S.A.", "America the Beautiful")
   - "Group Songs" = performed by a group/band/duo, NOT a solo artist (e.g. Queen, Boyz II Men, Destiny's Child, OutKast)

STEP 2 — VERIFICATION CHECK (CRITICAL):
Before finalizing your relevancy score, you MUST perform this verification:
- If you are about to give a relevancy score below 10, ask yourself: "Is this song genuinely in a COMPLETELY different world from this category, or is it just not a perfect fit?"
- A score of 0-5 is ONLY for songs that have absolutely NOTHING to do with the category (e.g. a Christmas song for "Gangster Rap", or a country ballad for "Afrobeats").
- If the song is even PARTIALLY in the right ballpark (right genre family, right era neighborhood, right general vibe), the relevancy should be at MINIMUM 10-15.
- For era categories: a song released 1-2 years outside the decade boundary (e.g. 1999 for "00's") should get 15-20 relevancy, not 0. It's close enough to penalize but not reject entirely.
- For mood categories: if a song could reasonably be played in that context by SOME people, give it at least 15 relevancy.
- ONLY give 0 relevancy for "(no pick)", fake/nonexistent songs, or songs that are genuinely the polar opposite of the category.

STEP 3 — SCORE (out of 100):
1. **Category Relevancy** (40 points) — Apply the rules above with the verification check.
2. **Popularity & Recognition** (25 points) — Chart performance, streams, cultural awareness.
3. **Cultural Impact** (20 points) — Influence within the genre, classic status.
4. **Boldness of Pick** (15 points) — Deep cut vs obvious/generic pick. Reward creativity.

If a song is "(no pick)" or clearly nonexistent, give total score of 0.

Respond with valid JSON only:
{{
  "song1Score": <number 0-100>,
  "song2Score": <number 0-100>,
  "song1Breakdown": {{
    "relevancy": <number 0-40>,
    "popularity": <number 0-25>,
    "impact": <number 0-20>,
    "boldness": <number 0-15>
  }},
  "song2Breakdown": {{
    "relevancy": <number 0-40>,
    "popularity": <number 0-25>,
    "impact": <number 0-20>,
    "boldness": <number 0-15>
  }},
  "song1Reasoning": "<2-3 sentences: what category type is this, did the song pass validation checks, explain score>",
  "song2Reasoning": "<2-3 sentences: what category type is this, did the song pass validation checks, explain score>",
  "verdict": "<1 sentence dramatic verdict announcing the winner>"
}}"""

    try:
        response = openai_client.chat.completions.create(
            model="gpt-5-mini",
            messages=[
                {"role": "system", "content": "You are an extremely knowledgeable music expert, historian, and fair judge. You know release years, genres, sub-genres, artist origins, regional sounds, and cultural context for songs across all eras and styles. You validate songs rigorously against category requirements before scoring. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            max_completion_tokens=2048
        )

        result_text = response.choices[0].message.content or "{}"
        finish_reason = response.choices[0].finish_reason
        if finish_reason == "length":
            print(f"AI Judge WARNING: Response truncated (finish_reason=length)")
        result = json.loads(result_text)
        return jsonify(result)

    except Exception as e:
        print(f"AI Judge error: {e}")
        return jsonify({"error": f"AI judge failed: {str(e)}"}), 500


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    if path and os.path.exists(os.path.join(DIST_DIR, path)):
        return send_from_directory(DIST_DIR, path)
    return send_from_directory(DIST_DIR, "index.html")


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3001))
    host = "0.0.0.0" if port == 5000 else "localhost"
    app.run(host=host, port=port)
