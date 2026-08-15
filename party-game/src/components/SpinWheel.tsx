import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { categories } from '../assets/categories'

interface SpinWheelProps {
  usedCategories: string[]
  onCategorySelected: (category: string) => void
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function SpinWheel({ usedCategories, onCategorySelected }: SpinWheelProps) {
  const [spinning, setSpinning] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [rotation, setRotation] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const wheelCategories = useMemo(() => {
    const availableCategories = categories.filter(c => !usedCategories.includes(c.name))
    const pool = availableCategories.length > 0 ? availableCategories : categories
    const shuffled = shuffleArray(pool)
    return shuffled.slice(0, Math.min(12, shuffled.length))
  }, [usedCategories])

  const sliceAngle = 360 / wheelCategories.length

  const drawWheel = (currentRotation: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = canvas.width
    const center = size / 2
    const radius = center - 8

    ctx.clearRect(0, 0, size, size)

    ctx.save()
    ctx.translate(center, center)
    ctx.rotate((currentRotation * Math.PI) / 180)

    wheelCategories.forEach((cat, i) => {
      const startAngle = (i * sliceAngle * Math.PI) / 180
      const endAngle = ((i + 1) * sliceAngle * Math.PI) / 180

      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.arc(0, 0, radius, startAngle, endAngle)
      ctx.closePath()

      ctx.fillStyle = cat.color + 'cc'
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'
      ctx.lineWidth = 1.5
      ctx.stroke()

      ctx.save()
      const midAngle = (startAngle + endAngle) / 2
      ctx.rotate(midAngle)
      ctx.translate(radius * 0.62, 0)
      ctx.rotate(Math.PI / 2)

      ctx.fillStyle = '#ffffff'
      ctx.font = `bold ${Math.max(9, Math.min(12, 140 / wheelCategories.length))}px system-ui, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      const name = cat.name
      const maxWidth = radius * 0.45
      if (ctx.measureText(name).width > maxWidth) {
        const words = name.split(' ')
        let line1 = ''
        let line2 = ''
        for (const word of words) {
          if (ctx.measureText(line1 + ' ' + word).width < maxWidth && !line2) {
            line1 = (line1 + ' ' + word).trim()
          } else {
            line2 = (line2 + ' ' + word).trim()
          }
        }
        ctx.fillText(line1, 0, -6)
        ctx.fillText(line2, 0, 8)
      } else {
        ctx.fillText(name, 0, 0)
      }

      ctx.restore()
    })

    ctx.restore()

    ctx.beginPath()
    ctx.arc(center, center, 28, 0, Math.PI * 2)
    ctx.fillStyle = '#1e1b4b'
    ctx.fill()
    ctx.strokeStyle = 'rgba(139,92,246,0.5)'
    ctx.lineWidth = 2
    ctx.stroke()
  }

  useEffect(() => {
    setSpinning(false)
    setSelectedCategory(null)
    setShowResult(false)
    setRotation(0)
    setTimeout(() => drawWheel(0), 0)
  }, [wheelCategories])

  const spin = () => {
    if (spinning) return
    setSpinning(true)
    setShowResult(false)
    setSelectedCategory(null)

    const winnerIndex = Math.floor(Math.random() * wheelCategories.length)
    const targetSlice = 360 - (winnerIndex * sliceAngle + sliceAngle / 2)
    const fullSpins = 5 + Math.floor(Math.random() * 3)
    const finalRotation = rotation + fullSpins * 360 + targetSlice - (rotation % 360)

    const duration = 4000
    const startTime = Date.now()
    const startRotation = rotation

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      const eased = 1 - Math.pow(1 - progress, 4)
      const currentRotation = startRotation + (finalRotation - startRotation) * eased

      drawWheel(currentRotation)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setRotation(finalRotation)
        setSelectedCategory(wheelCategories[winnerIndex].name)
        setSpinning(false)
        setShowResult(true)
      }
    }

    requestAnimationFrame(animate)
  }

  const confirmCategory = () => {
    if (selectedCategory) {
      onCategorySelected(selectedCategory)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
          <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-yellow-400 drop-shadow-lg" />
        </div>

        <div className="relative w-[320px] h-[320px] sm:w-[380px] sm:h-[380px]">
          <canvas
            ref={canvasRef}
            width={380}
            height={380}
            className="w-full h-full rounded-full shadow-2xl"
            style={{ filter: 'drop-shadow(0 0 20px rgba(139,92,246,0.3))' }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showResult && selectedCategory ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center space-y-4"
          >
            <div className="text-sm text-white/40 uppercase tracking-widest">This Round's Category</div>
            <div className="text-3xl sm:text-4xl font-bold gradient-text-hero">{selectedCategory}</div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              onClick={confirmCategory}
              className="glass-btn px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg shadow-glow-purple"
            >
              Let's Battle!
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="spin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              onClick={spin}
              disabled={spinning}
              className={`glass-btn px-10 py-4 text-xl font-bold shadow-glow-purple ${
                spinning
                  ? 'bg-gray-700 text-white/50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
              }`}
            >
              {spinning ? 'Spinning...' : 'Spin the Wheel!'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
