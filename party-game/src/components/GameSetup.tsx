import { useState } from 'react'
import { motion } from 'framer-motion'
import SceneBackground from './SceneBackground'
import type { GameState, JudgeMode } from '../App'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function GameSetup({
  state,
  setState,
}: {
  state: GameState
  setState: React.Dispatch<React.SetStateAction<GameState>>
}) {
  const [p1Name, setP1Name] = useState(state.player1.name)
  const [p2Name, setP2Name] = useState(state.player2.name)
  const [numCategories, setNumCategories] = useState(state.totalCategories)
  const [judgeMode, setJudgeMode] = useState<JudgeMode>(state.judgeMode)

  const startGame = () => {
    if (!p1Name.trim() || !p2Name.trim()) return
    setState(s => ({
      ...s,
      phase: 'spin',
      player1: { ...s.player1, name: p1Name.trim() },
      player2: { ...s.player2, name: p2Name.trim() },
      totalCategories: numCategories,
      judgeMode,
    }))
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6">
      <SceneBackground />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-md glass-card-elevated p-8 sm:p-10"
      >
        <motion.div variants={item} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20 mb-5">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight gradient-text-hero mb-3">
            Song Battle Royale
          </h1>
          <p className="text-sm sm:text-base text-white/40 tracking-wide">
            Pick songs. Battle it out. Crown the champion.
          </p>
        </motion.div>

        <div className="space-y-5 mb-6">
          <motion.div variants={item}>
            <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
              Player 1
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                <span className="text-xs font-bold text-blue-400">1</span>
              </div>
              <input
                type="text"
                value={p1Name}
                onChange={e => setP1Name(e.target.value)}
                placeholder="Enter name"
                className="w-full pl-14 pr-4 py-4 glass-input text-white placeholder-white/25 text-base"
              />
            </div>
          </motion.div>

          <motion.div variants={item}>
            <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
              Player 2
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-pink-500/20 border border-pink-400/30 flex items-center justify-center">
                <span className="text-xs font-bold text-pink-400">2</span>
              </div>
              <input
                type="text"
                value={p2Name}
                onChange={e => setP2Name(e.target.value)}
                placeholder="Enter name"
                className="w-full pl-14 pr-4 py-4 glass-input text-white placeholder-white/25 text-base"
              />
            </div>
          </motion.div>

          <motion.div variants={item}>
            <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
              Rounds
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { val: 1, label: '1', sub: 'Quick' },
                { val: 3, label: '3', sub: 'Standard' },
                { val: 5, label: '5', sub: 'Extended' },
                { val: 7, label: '7', sub: 'Marathon' },
              ].map(opt => (
                <button
                  key={opt.val}
                  onClick={() => setNumCategories(opt.val)}
                  className={`py-3 rounded-xl text-center transition-all duration-200 ${
                    numCategories === opt.val
                      ? 'bg-purple-500/20 border border-purple-400/40 ring-glow-purple text-white'
                      : 'bg-white/[0.03] border border-white/[0.06] text-white/50 hover:bg-white/[0.06] hover:text-white/70'
                  }`}
                >
                  <div className="text-lg font-bold">{opt.label}</div>
                  <div className="text-[10px] uppercase tracking-wider opacity-60">
                    {opt.sub}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div variants={item}>
            <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
              Judge Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setJudgeMode('human')}
                className={`py-4 px-3 rounded-xl text-center transition-all duration-200 ${
                  judgeMode === 'human'
                    ? 'bg-amber-500/20 border border-amber-400/40 text-white'
                    : 'bg-white/[0.03] border border-white/[0.06] text-white/50 hover:bg-white/[0.06] hover:text-white/70'
                }`}
              >
                <div className="text-2xl mb-1">&#9878;</div>
                <div className="text-sm font-bold">Human Judge</div>
                <div className="text-[10px] text-white/40 mt-0.5">You decide the winner</div>
              </button>
              <button
                onClick={() => setJudgeMode('ai')}
                className={`py-4 px-3 rounded-xl text-center transition-all duration-200 ${
                  judgeMode === 'ai'
                    ? 'bg-cyan-500/20 border border-cyan-400/40 text-white'
                    : 'bg-white/[0.03] border border-white/[0.06] text-white/50 hover:bg-white/[0.06] hover:text-white/70'
                }`}
              >
                <div className="text-2xl mb-1">&#129302;</div>
                <div className="text-sm font-bold">AI Judge</div>
                <div className="text-[10px] text-white/40 mt-0.5">AI scores each pick</div>
              </button>
            </div>
          </motion.div>

          <motion.div variants={item}>
            <button
              onClick={() =>
                setState(s => ({ ...s, splitMode: !s.splitMode }))
              }
              className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-200 ${
                state.splitMode
                  ? 'bg-cyan-500/10 border border-cyan-400/30'
                  : 'bg-white/[0.03] border border-white/[0.06]'
              }`}
            >
              <div
                className={`w-10 h-6 rounded-full relative transition-colors duration-200 ${
                  state.splitMode ? 'bg-cyan-500' : 'bg-white/10'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                    state.splitMode ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </div>
              <div className="text-left">
                <div
                  className={`text-sm font-medium ${
                    state.splitMode ? 'text-cyan-300' : 'text-white/60'
                  }`}
                >
                  Split-Screen Mode
                </div>
                <div className="text-xs text-white/30">
                  One tab per player for extra suspense
                </div>
              </div>
            </button>
          </motion.div>
        </div>

        <motion.div variants={item}>
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.01 }}
            onClick={startGame}
            disabled={!p1Name.trim() || !p2Name.trim()}
            className="glass-btn w-full py-4 text-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-glow-purple disabled:shadow-none disabled:from-gray-700 disabled:to-gray-700"
          >
            Start Battle
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  )
}
