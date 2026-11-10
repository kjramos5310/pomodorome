import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Download, Sparkles } from 'lucide-react'

// 9. COMPLETED SCREEN
export default function CompletedScreen({ history, currentDeepwork, totalDeepworks, sessionData, logs, onNextDeepwork, onAddExtraDeepwork, onFinishDay, onExportLogs }) {
  const isLastDeepwork = currentDeepwork >= totalDeepworks

  // Verificar si batió récord de deepworks completados hoy
  const todayStr = new Date().toISOString().split('T')[0]
  const todayDeepworks = history.filter(e => e.date.startsWith(todayStr)).reduce((s, e) => s + (e.deepworksCompleted || 1), 0)

  const otherDaysDeepworks = history.filter(e => !e.date.startsWith(todayStr)).reduce((acc, e) => {
    const d = e.date.split('T')[0]
    acc[d] = (acc[d] || 0) + (e.deepworksCompleted || 1)
    return acc
  }, {})
  const maxOtherDay = Math.max(0, ...Object.values(otherDaysDeepworks))
  const isRecord = todayDeepworks > maxOtherDay && todayDeepworks > 1;

  useEffect(() => {
    // Sonido súper satisfactorio de bloque completado
    const sound = new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3')
    sound.volume = 0.6
    sound.play().catch(e => console.log('Audio error:', e))
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 px-8 py-12"
    >
      {/* Celebration */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 10 }}
        className="mb-8"
      >
        <Sparkles size={80} className="text-gold-500" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-4xl font-bold mb-4"
      >
        ¡Deepwork completado!
      </motion.h2>

      {isRecord && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', delay: 0.6 }}
          className="mb-6 bg-gold-500/10 border border-gold-500/30 text-gold-400 px-6 py-2 rounded-full font-medium inline-flex items-center gap-2"
        >
          <span>🏆</span> ¡Rompiste tu récord de hoy! ({todayDeepworks} deepworks)
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center mb-12"
      >
        <p className="text-2xl text-gray-300 mb-2">
          Deepwork {currentDeepwork} de {totalDeepworks}
        </p>
        <div className="flex gap-2 justify-center mt-4">
          {[...Array(totalDeepworks)].map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${i < currentDeepwork ? 'bg-gold-500' : 'bg-neutral-700'
                }`}
            />
          ))}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-neutral-850/50 backdrop-blur-sm p-8 rounded-3xl max-w-md w-full mb-8"
      >
        <h3 className="text-xl font-semibold mb-4 text-center">Resumen de sesión</h3>
        <div className="space-y-3 text-gray-300">
          <div className="flex justify-between">
            <span>Preguntas respondidas:</span>
            <span className="font-semibold text-gold-500">{sessionData.questionsAnswered || 0}</span>
          </div>
          <div className="flex justify-between">
            <span>Tiempo de focus:</span>
            <span className="font-semibold text-gold-500">
              {Math.floor((sessionData.duration || 0) / 60)}m {(sessionData.duration || 0) % 60}s
            </span>
          </div>
          <div className="flex justify-between">
            <span>Total de eventos:</span>
            <span className="font-semibold text-gold-500">{logs.length}</span>
          </div>
          {sessionData.inboxItems?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-neutral-700">
              <span className="block text-blue-400 mb-2 font-medium">Distracciones capturadas:</span>
              <ul className="list-disc pl-5 space-y-1">
                {sessionData.inboxItems.map((item, i) => (
                  <li key={i} className="text-sm text-gray-400">{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.div>

      {/* Actions */}
      <div className="space-y-4 w-full max-w-md">
        {!isLastDeepwork && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNextDeepwork}
            className="w-full py-5 bg-gold-500 hover:bg-gold-600 text-black font-semibold rounded-full text-lg transition-colors"
          >
            Siguiente Deepwork
          </motion.button>
        )}

        {isLastDeepwork && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', damping: 10 }}
              className="text-center py-6"
            >
              <p className="text-3xl font-bold text-gold-500 mb-2">🎊 ¡Felicidades! 🎊</p>
              <p className="text-xl text-gray-300">
                ¡Completaste tus {totalDeepworks} deepworks del día!
              </p>
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onAddExtraDeepwork}
              className="w-full py-5 bg-gold-500 hover:bg-gold-600 text-black font-semibold rounded-full text-lg transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={24} />
              Agregar otro deepwork
            </motion.button>
          </>
        )}

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onExportLogs}
          className="w-full py-5 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-full text-lg transition-colors flex items-center justify-center gap-2"
        >
          <Download size={20} />
          Exportar Logs
        </motion.button>

        {isLastDeepwork && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onFinishDay}
            className="w-full py-4 bg-neutral-700 hover:bg-neutral-600 text-white rounded-full transition-colors"
          >
            Finalizar día
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}
