import { useState, useEffect, useRef } from 'react'

const RADIUS = 38
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function Timer({
  seconds,
  onEnd,
}: {
  seconds: number
  onEnd: () => void
}) {
  const [remaining, setRemaining] = useState(seconds)
  const onEndRef = useRef(onEnd)
  onEndRef.current = onEnd

  useEffect(() => {
    setRemaining(seconds)
  }, [seconds])

  useEffect(() => {
    if (remaining <= 0) {
      onEndRef.current()
      return
    }

    const id = setInterval(() => {
      setRemaining(r => r - 1)
    }, 1000)

    return () => clearInterval(id)
  }, [remaining])

  const pct = remaining / seconds
  const offset = CIRCUMFERENCE * (1 - pct)
  const isLow = remaining <= 10
  const isMid = remaining <= 20

  const strokeColor = isLow
    ? '#ef4444'
    : isMid
      ? '#eab308'
      : '#a78bfa'

  const glowColor = isLow
    ? 'rgba(239, 68, 68, 0.4)'
    : isMid
      ? 'rgba(234, 179, 8, 0.3)'
      : 'rgba(167, 139, 250, 0.3)'

  return (
    <div className="flex items-center gap-4">
      {/* Circular gauge */}
      <div className="relative w-20 h-20 flex-shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 84 84">
          {/* Track */}
          <circle
            cx="42"
            cy="42"
            r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="4"
          />
          {/* Progress arc */}
          <circle
            cx="42"
            cy="42"
            r={RADIUS}
            fill="none"
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease',
              filter: `drop-shadow(0 0 6px ${glowColor})`,
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`font-display text-xl font-bold tabular-nums ${
              isLow ? 'text-red-400 animate-pulse' : 'text-white'
            }`}
          >
            {remaining}
          </span>
        </div>
      </div>

      {/* Linear bar fallback on small screens */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-white/40 uppercase tracking-wider">
            Time Remaining
          </span>
        </div>
        <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-linear"
            style={{
              width: `${pct * 100}%`,
              background: strokeColor,
              boxShadow: `0 0 8px ${glowColor}`,
            }}
          />
        </div>
        {isLow && (
          <div className="text-xs text-red-400/80 mt-1 animate-pulse">
            Hurry up!
          </div>
        )}
      </div>
    </div>
  )
}
