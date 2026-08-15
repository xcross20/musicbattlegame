import { motion } from 'framer-motion'
import Confetti from 'react-confetti'
import SceneBackground from './SceneBackground'
import type { GameState } from '../App'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
}

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function GameOver({
  state,
  onPlayAgain,
}: {
  state: GameState
  onPlayAgain: () => void
}) {
  const p1 = state.player1
  const p2 = state.player2
  const total = p1.score + p2.score

  const winner =
    p1.score > p2.score ? p1.name :
    p2.score > p1.score ? p2.name :
    null

  const winnerIsP1 = p1.score > p2.score
  const isTie = winner === null

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6">
      <SceneBackground />
      <Confetti
        numberOfPieces={350}
        recycle={false}
        style={{ position: 'fixed', top: 0, left: 0, zIndex: 50 }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-md glass-card-elevated p-8 sm:p-10 text-center"
      >
        {/* Trophy icon */}
        <motion.div
          variants={item}
          className="mb-6"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full"
            style={{
              background: isTie
                ? 'radial-gradient(circle, rgba(167,139,250,0.2) 0%, transparent 70%)'
                : winnerIsP1
                  ? 'radial-gradient(circle, rgba(96,165,250,0.2) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(244,114,182,0.2) 0%, transparent 70%)',
              boxShadow: isTie
                ? '0 0 40px rgba(167,139,250,0.15)'
                : winnerIsP1
                  ? '0 0 40px rgba(96,165,250,0.15)'
                  : '0 0 40px rgba(244,114,182,0.15)',
            }}
          >
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-amber-400" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.div variants={item}>
          <h1 className="font-display text-4xl sm:text-5xl font-bold gradient-text-gold mb-2">
            Game Over
          </h1>
        </motion.div>

        {/* Winner announcement */}
        <motion.div variants={item} className="mb-8">
          {isTie ? (
            <div className="text-xl text-white/60 font-medium">
              It&apos;s a tie!
            </div>
          ) : (
            <div>
              <motion.span
                className="text-2xl font-bold"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ color: winnerIsP1 ? '#60a5fa' : '#f472b6' }}
              >
                {winner}
              </motion.span>
              <span className="text-xl text-white/60"> wins!</span>
            </div>
          )}
        </motion.div>

        {/* Score cards */}
        <motion.div variants={item} className="grid grid-cols-2 gap-3 mb-6">
          <div
            className="rounded-2xl p-5 text-center"
            style={{
              background: 'rgba(96,165,250,0.06)',
              border: '1px solid rgba(96,165,250,0.15)',
              boxShadow: winnerIsP1 ? '0 0 30px rgba(96,165,250,0.1)' : 'none',
            }}
          >
            <div className="text-xs text-white/40 uppercase tracking-wider mb-1">
              {p1.name}
            </div>
            <div className="font-display text-4xl font-bold text-blue-400 mb-1">
              {p1.score}
            </div>
            <div className="text-xs text-white/30">
              {p1.categoriesWon} categories
            </div>
          </div>

          <div
            className="rounded-2xl p-5 text-center"
            style={{
              background: 'rgba(244,114,182,0.06)',
              border: '1px solid rgba(244,114,182,0.15)',
              boxShadow: !winnerIsP1 && !isTie ? '0 0 30px rgba(244,114,182,0.1)' : 'none',
            }}
          >
            <div className="text-xs text-white/40 uppercase tracking-wider mb-1">
              {p2.name}
            </div>
            <div className="font-display text-4xl font-bold text-pink-400 mb-1">
              {p2.score}
            </div>
            <div className="text-xs text-white/30">
              {p2.categoriesWon} categories
            </div>
          </div>
        </motion.div>

        {/* Score distribution bar */}
        <motion.div variants={item} className="mb-8">
          <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden flex">
            <div
              className="h-full bg-blue-400 transition-all duration-1000"
              style={{
                width: total > 0 ? `${(p1.score / total) * 100}%` : '50%',
                boxShadow: '0 0 8px rgba(96,165,250,0.4)',
              }}
            />
            <div
              className="h-full bg-pink-400 transition-all duration-1000"
              style={{
                width: total > 0 ? `${(p2.score / total) * 100}%` : '50%',
                boxShadow: '0 0 8px rgba(244,114,182,0.4)',
              }}
            />
          </div>
        </motion.div>

        {/* Play again */}
        <motion.div variants={item}>
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.01 }}
            onClick={onPlayAgain}
            className="glass-btn w-full py-4 text-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-glow-purple"
          >
            Play Again
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  )
}
