import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

// 4. WARM-UP SCREEN
export default function WarmUpScreen({ mood, currentDeepwork, totalDeepworks, duration, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [showConfetti, setShowConfetti] = useState(false)
  const endTimeRef = useRef(Date.now() + duration * 1000)
  const isCompletingRef = useRef(false)
  // Guardar el callback en una ref: si el padre re-renderiza, el timeout de cierre no se pierde
  const onCompleteRef = useRef(onComplete)
  useEffect(() => { onCompleteRef.current = onComplete })

  // Temporizador basado en tiempo absoluto
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000))
      setTimeLeft(remaining)
      if (remaining <= 0) clearInterval(timer)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Lógica de finalización
  useEffect(() => {
    if (timeLeft <= 0 && !isCompletingRef.current) {
      isCompletingRef.current = true
      setShowConfetti(true)
      const t = setTimeout(() => onCompleteRef.current(), 1500)
      return () => clearTimeout(t)
    }
  }, [timeLeft])

  const skip = () => {
    if (isCompletingRef.current) return
    isCompletingRef.current = true
    onCompleteRef.current()
  }

  const progress = ((duration - timeLeft) / duration) * 100
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-full flex flex-col bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950"
    >
      {/* Header */}
      <div className="p-6 flex items-center justify-between">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-500/20 to-gold-700/20 animate-pulse" />
        <div className="text-center">
          <p className="text-gray-400 text-sm">Deepwork {currentDeepwork} de {totalDeepworks}</p>
          <p className="text-white font-medium">Warm-up</p>
        </div>
        <div className="w-16" />
      </div>

      {/* Timer */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <motion.div className="relative">
          {/* Progress Ring */}
          <svg className="w-80 h-80 transform -rotate-90">
            <circle
              cx="160"
              cy="160"
              r="140"
              stroke="#374151"
              strokeWidth="8"
              fill="none"
            />
            <motion.circle
              cx="160"
              cy="160"
              r="140"
              stroke="#F59E0B"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              initial={{ strokeDashoffset: 880 }}
              animate={{ strokeDashoffset: 880 - (880 * progress) / 100 }}
              style={{ strokeDasharray: 880 }}
              transition={{ duration: 1 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-7xl font-bold">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-gray-400 text-center max-w-md"
        >
          Escaneando... sin presión de entender
        </motion.p>

        <button
          onClick={skip}
          className="mt-8 px-6 py-3 text-sm font-mono uppercase tracking-wider text-gray-400 hover:text-orange-400 border border-neutral-700 hover:border-orange-500/50 transition-colors"
          style={{ clipPath: 'polygon(6px 0%, 100% 0%, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0% 100%, 0% 6px)' }}
        >
          Ya escaneé — saltar →
        </button>
      </div>

      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: '50vw', y: '50vh', opacity: 1 }}
              animate={{
                x: Math.random() * window.innerWidth,
                y: -100,
                opacity: 0,
                rotate: 720
              }}
              transition={{ duration: 1, delay: i * 0.05 }}
              className="absolute w-4 h-4 bg-gold-500 rounded-full"
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}
