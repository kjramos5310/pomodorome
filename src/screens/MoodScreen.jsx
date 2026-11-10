import { useState } from 'react'
import { motion } from 'framer-motion'

// 2. MOOD SCREEN
export default function MoodScreen({ onSelectMood, moods }) {
  const [selected, setSelected] = useState(null)

  // Fallback si no llegan props
  const moodList = moods ?? [
    { id: 'bajo', emoji: '😴', label: 'Bajo' },
    { id: 'neutro', emoji: '😐', label: 'Neutro' },
    { id: 'ready', emoji: '🔥', label: 'Ready' },
    { id: 'flow', emoji: '🌀', label: 'Flow' },
  ]

  const handleSelect = (moodId) => {
    setSelected(moodId)
    setTimeout(() => {
      onSelectMood(moodId)
    }, 300)
  }

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '-100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 px-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl font-semibold mb-4">¿Cómo estás hoy?</h2>
        <p className="text-gray-400 text-sm">Sé honesto, no hay respuesta incorrecta</p>
      </motion.div>

      <div className="flex gap-6 flex-wrap justify-center max-w-2xl">
        {moodList.map((mood, index) => (
          <motion.button
            key={mood.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: selected && selected !== mood.id ? 0.4 : 1,
              scale: selected === mood.id ? 1.15 : 1
            }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: selected ? 1 : 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelect(mood.id)}
            className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-neutral-850/50 backdrop-blur-sm hover:bg-neutral-850 transition-colors min-w-[140px]"
          >
            <span className="text-6xl">{mood.emoji}</span>
            <span className="text-white font-medium">{mood.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
