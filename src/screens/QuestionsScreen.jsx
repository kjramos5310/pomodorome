import { useState } from 'react'
import { motion } from 'framer-motion'

// 5. QUESTIONS SCREEN
export default function QuestionsScreen({ onStart }) {
  const [q1, setQ1] = useState('')
  const [q2, setQ2] = useState('')
  const [q3, setQ3] = useState('')

  const handleStart = () => {
    const filtered = [q1, q2, q3].filter(q => q.trim() !== '')
    // Si no hay preguntas, usamos placeholder amable para no bloquear
    const questions = filtered.length > 0 ? filtered : ['Enfocarse en la tarea de hoy']
    onStart(questions)
  }

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '-100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="min-h-screen w-full flex flex-col bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 px-8 py-12"
    >
      <div className="max-w-2xl w-full mx-auto flex-1 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-semibold mb-2">¿Qué preguntas te surgieron?</h2>
          <p className="text-gray-400 text-sm">En el warm-up, ¿qué te llamó la atención?</p>
        </motion.div>

        <div className="space-y-6 flex-1">
          <motion.input
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            type="text"
            value={q1}
            onChange={(e) => setQ1(e.target.value)}
            placeholder="Pregunta 1..."
            className="w-full p-5 bg-neutral-850/50 border border-neutral-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors text-lg"
          />
          <motion.input
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            type="text"
            value={q2}
            onChange={(e) => setQ2(e.target.value)}
            placeholder="Pregunta 2 (opcional)..."
            className="w-full p-5 bg-neutral-850/50 border border-neutral-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors text-lg"
          />
          <motion.input
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            type="text"
            value={q3}
            onChange={(e) => setQ3(e.target.value)}
            placeholder="Pregunta 3 (opcional)..."
            className="w-full p-5 bg-neutral-850/50 border border-neutral-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors text-lg"
          />
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleStart}
          className="w-full py-5 bg-gold-500 hover:bg-gold-600 text-black font-semibold rounded-full text-lg transition-colors mt-8"
        >
          EMPEZAR AHORA
        </motion.button>
      </div>
    </motion.div>
  )
}
