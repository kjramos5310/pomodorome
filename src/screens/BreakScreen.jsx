import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

// 6.5 BREAK SCREEN
const BREAK_TIPS = [
  '💧 Toma un vaso de agua',
  '🧘 Respira profundo — 4 segundos adentro, 4 afuera',
  '👀 Mira por la ventana o un punto lejano por 1 minuto',
  '🚶 Da unos pasos, mueve el cuerpo',
  '🤸 Estira el cuello y los hombros',
  '😊 Sonríe — tu cerebro acaba de hacer algo valioso',
]
export default function BreakScreen({ duration, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [tipIndex] = useState(() => Math.floor(Math.random() * BREAK_TIPS.length))
  const endTimeRef = useRef(Date.now() + duration * 1000)
  const isCompletingRef = useRef(false)

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
      onComplete()
    }
  }, [timeLeft, onComplete])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const progress = ((duration - timeLeft) / duration) * 100

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-950 via-neutral-900 to-blue-950 px-8"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-12"
      >
        <span className="text-6xl mb-6 block">☕</span>
        <h2 className="text-4xl font-bold text-blue-400 mb-2">¡Buen trabajo! Descansa.</h2>
        {/* Tip rotativo */}
        <motion.p
          key={tipIndex}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-gray-300 text-lg mt-3 font-medium"
        >
          {BREAK_TIPS[tipIndex]}
        </motion.p>
      </motion.div>

      <div className="relative mb-12">
        <svg className="w-64 h-64 transform -rotate-90">
          <circle cx="128" cy="128" r="110" stroke="#1e3a8a" strokeWidth="6" fill="none" />
          <motion.circle
            cx="128" cy="128" r="110" stroke="#3b82f6" strokeWidth="6" fill="none"
            strokeLinecap="round"
            style={{ strokeDasharray: 691, strokeDashoffset: 691 - (691 * progress) / 100 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl font-bold text-blue-400">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
      </div>

      <button
        onClick={onComplete}
        className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 text-gray-300 font-medium rounded-full transition-colors"
      >
        Saltar descanso
      </button>
    </motion.div>
  )
}
