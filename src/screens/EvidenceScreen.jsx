import { useState } from 'react'
import { motion } from 'framer-motion'

// 8. EVIDENCE SCREEN (Anti-Cobra)
export default function EvidenceScreen({ onNext }) {
  const [selectedType, setSelectedType] = useState(null)
  const [content, setContent] = useState('')

  const evidenceTypes = [
    { id: 'screenshot', icon: '📸', label: 'Screenshot' },
    { id: 'link', icon: '🔗', label: 'Link' },
    { id: 'flashcard', icon: '📝', label: 'Flashcard' },
    { id: 'audio', icon: '🎤', label: 'Audio 30s' },
  ]

  const handleNext = (skip = false) => {
    if (skip) {
      onNext({ type: null, content: '', skipped: true })
      return
    }
    // Evidencia opcional — si no seleccionó nada, guardamos como 'none'
    onNext({ type: selectedType || 'none', content })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-full flex flex-col bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 px-8 py-12"
    >
      <div className="max-w-2xl w-full mx-auto flex-1 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-semibold mb-2">¿Qué produjiste?</h2>
          <p className="text-gray-400 text-sm mb-2">Opcional — guarda algo si quieres recordarlo</p>
          <p className="text-indigo-300 text-xs font-medium">✨ Tu trabajo ya cuenta, lo registres o no</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {evidenceTypes.map((type, index) => (
            <motion.button
              key={type.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedType(type.id)}
              className={`p-6 rounded-2xl transition-all ${selectedType === type.id
                ? 'bg-gold-500 text-black scale-105'
                : 'bg-neutral-850/50 hover:bg-neutral-850'
                }`}
            >
              <div className="text-4xl mb-2">{type.icon}</div>
              <div className="font-medium">{type.label}</div>
            </motion.button>
          ))}
        </div>

        {/* Content Input */}
        {selectedType && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex-1"
          >
            {selectedType === 'link' && (
              <input
                type="url"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="https://..."
                className="w-full p-5 bg-neutral-850/50 border border-neutral-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-gold-500"
              />
            )}
            {selectedType === 'flashcard' && (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escribe tu flashcard..."
                className="w-full h-40 p-5 bg-neutral-850/50 border border-neutral-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 resize-none"
              />
            )}
            {selectedType === 'screenshot' && (
              <div className="p-8 border-2 border-dashed border-neutral-700 rounded-2xl text-center">
                <p className="text-gray-400 mb-4">Selecciona tu screenshot</p>
                <button
                  onClick={() => setContent('screenshot_selected.png')}
                  className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-full transition-colors"
                >
                  Seleccionar archivo
                </button>
              </div>
            )}
            {selectedType === 'audio' && (
              <div className="p-8 border-2 border-dashed border-neutral-700 rounded-2xl text-center">
                <p className="text-gray-400 mb-4">Graba tu audio de 30s</p>
                <button
                  onClick={() => setContent('audio_recorded.mp3')}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 rounded-full transition-colors flex items-center gap-2 mx-auto"
                >
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                  Grabar
                </button>
              </div>
            )}
          </motion.div>
        )}

        <div className="flex flex-col gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleNext(false)}
            className="w-full py-5 bg-gold-500 hover:bg-gold-600 text-black font-semibold rounded-full text-lg transition-colors"
          >
            Guardar evidencia
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
