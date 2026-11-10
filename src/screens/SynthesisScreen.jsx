import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

// 7. SYNTHESIS SCREEN (Feynman)
export default function SynthesisScreen({ onNext }) {
  const [explanation, setExplanation] = useState('')
  const [stuckOn, setStuckOn] = useState([])

  const toggleStuck = (part) => {
    setStuckOn(prev =>
      prev.includes(part) ? prev.filter(p => p !== part) : [...prev, part]
    )
  }

  const handleNext = (skip = false) => {
    // Síntesis opcional — no bloqueamos si el cerebro está cansado
    onNext({ explanation: skip ? '' : explanation, stuckOn, skipped: skip })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-full flex flex-col bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 px-8 py-12"
    >
      <div className="max-w-3xl w-full mx-auto flex-1 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-semibold mb-2">Explícalo como si fuera a un niño</h2>
          <p className="text-gray-400 text-sm">Método Feynman: simplifica al máximo</p>
        </motion.div>

        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="¿Qué aprendiste? Explícalo con tus propias palabras..."
          className="w-full flex-1 min-h-[300px] p-6 bg-neutral-850/50 border border-neutral-700 rounded-3xl text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors resize-none mb-8"
        />

        <div className="mb-8">
          <p className="text-lg font-medium mb-4">¿Dónde te trabaste?</p>
          <div className="flex gap-4 flex-wrap">
            {['Parte A', 'Parte B', 'Todo bien'].map((part) => (
              <button
                key={part}
                onClick={() => toggleStuck(part)}
                className={`px-6 py-3 rounded-full transition-all ${stuckOn.includes(part)
                  ? 'bg-gold-500 text-black'
                  : 'bg-neutral-800 text-gray-300 hover:bg-neutral-700'
                  }`}
              >
                {stuckOn.includes(part) && <Check className="inline mr-2" size={18} />}
                {part}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleNext(false)}
            className="w-full py-5 bg-gold-500 hover:bg-gold-600 text-black font-semibold rounded-full text-lg transition-colors"
          >
            Guardar síntesis
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleNext(true)}
            className="w-full py-3 text-gray-400 hover:text-gray-200 text-sm transition-colors rounded-full hover:bg-neutral-800"
          >
            Saltar por ahora
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
