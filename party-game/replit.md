# Song Battle Royale

## Overview
A fun interactive game where two players pick songs and battle it out to crown a champion. Built with React, TypeScript, Vite, Tailwind CSS, and Framer Motion. Uses ytmusicapi (Python) for song search and OpenAI for AI judge mode.

## Project Architecture
- **Frontend**: React 18 + TypeScript + Vite 5
- **Backend**: Python Flask + ytmusicapi 1.11.5 + OpenAI (via Replit AI Integrations)
- **Styling**: Tailwind CSS 3 + PostCSS + Autoprefixer
- **Animations**: Framer Motion
- **Effects**: react-confetti

### Directory Structure
```
/
├── server/
│   └── app.py             # Flask API server (port 3001)
├── src/
│   ├── App.tsx            # Main app component + SpinPhase
│   ├── main.tsx           # Entry point
│   ├── index.css          # Global styles
│   ├── vite-env.d.ts      # Vite type declarations
│   ├── assets/
│   │   └── categories.ts  # 46 song categories with colors
│   └── components/
│       ├── BattleScreen.tsx  # Main battle + AI/human judging
│       ├── GameOver.tsx
│       ├── GameSetup.tsx     # Player setup + judge mode selector
│       ├── SceneBackground.tsx
│       ├── SpinWheel.tsx     # Animated category wheel
│       └── Timer.tsx
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── postcss.config.js
```

## Game Flow
Setup → Spin Wheel → Battle (3 rounds per category) → Spin Wheel → ... → Game Over

## Judge Modes
- **Human Judge**: Designated judge manually picks the winner each round
- **AI Judge**: OpenAI (gpt-5-mini) scores each song out of 100 based on category relevancy (40pts), popularity (25pts), cultural impact (20pts), and boldness (15pts)

## API
- `GET /api/search?q=<query>` — Search songs via ytmusicapi
- `POST /api/ai-judge` — AI judge scoring (body: category, song1, song2, player names)

## Environment Variables
- `AI_INTEGRATIONS_OPENAI_API_KEY` — Auto-set by Replit AI Integrations
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — Auto-set by Replit AI Integrations
- ytmusicapi works without authentication

## Development
- Workflow: `python server/app.py & npm run dev`
- Backend: Flask on localhost:3001
- Frontend: Vite on 0.0.0.0:5000 (proxies /api to backend)
- Build: `npm run build`
- Deployment: autoscale (Flask serves static + API)
