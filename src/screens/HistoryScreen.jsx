import { useRef } from 'react'
import { motion } from 'framer-motion'
import { sessionTitle } from '../lib/worlds'

// HISTORY SCREEN
export default function HistoryScreen({ history, projects, onImport, onDeleteEntry }) {
  const fileInputRef = useRef(null)

  const groupedHistory = history.reduce((acc, entry) => {
    const date = new Date(entry.date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    if (!acc[date]) acc[date] = []
    acc[date].push(entry)
    return acc
  }, {})

  const moodEmojis = {
    bajo: '😴',
    neutro: '😐',
    ready: '🔥',
    flow: '🌀'
  }

  const downloadEntry = (entry) => {
    const dataStr = JSON.stringify(entry, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `session-${entry.projectName}-${new Date(entry.date).toISOString().split('T')[0]}.json`
    link.click()
  }

  const downloadAllHistory = () => {
    // Exportamos un objeto completo con { history, projects } para backup total
    const fullBackup = {
      timestamp: new Date().toISOString(),
      history: history,
      projects: projects || []
    }

    const dataStr = JSON.stringify(fullBackup, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `deepwork-backup-${new Date().toISOString().split('T')[0]}.json`
    link.click()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-full pt-20 px-8 pb-8"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Historial</h1>
          <div className="flex gap-2">
            <button
              onClick={downloadAllHistory}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-gold-500 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
            >
              📤 Exportar todo
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={onImport}
              className="hidden"
              accept=".json"
            />
            <button
              onClick={() => fileInputRef.current.click()}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-gold-500 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
            >
              📥 Importar JSON
            </button>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No hay sesiones registradas aún</p>
            <p className="text-gray-500 text-sm mt-2">Completa tu primer deepwork para verlo aquí </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedHistory).map(([date, entries]) => (
              <div key={date}>
                <h3 className="text-lg font-semibold text-gray-400 mb-4">{date}</h3>
                <div className="space-y-4">
                  {entries.map(entry => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-neutral-850/50 p-6 rounded-2xl"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{moodEmojis[entry.mood]}</span>
                          <div>
                            <h4 className="font-semibold text-lg">{sessionTitle(entry, history, projects) || entry.projectName}</h4>
                            {sessionTitle(entry, history, projects) && <p className="text-xs text-gray-500">{entry.projectEmoji} {entry.projectName}</p>}
                            <p className="text-sm text-gray-400">
                              {new Date(entry.date).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <p className="text-2xl font-bold text-gold-500">
                            {entry.deepworksCompleted}/{entry.deepworksPlanned}
                          </p>
                          <p className="text-xs text-gray-400 mb-2">deepworks</p>
                          <div className="flex gap-3">
                            <button
                              onClick={() => downloadEntry(entry)}
                              className="text-xs text-neutral-500 hover:text-gold-500 transition-colors"
                              title="Descargar como JSON"
                            >
                              💾 JSON
                            </button>
                            <button
                              onClick={() => onDeleteEntry(entry.id)}
                              className="text-xs text-red-500/70 hover:text-red-500 transition-colors"
                              title="Eliminar sesión"
                            >
                              🗑️ Eliminar
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Preguntas trabajadas</p>
                          <p className="font-medium">{entry.questions?.length || 0}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Duración</p>
                          <p className="font-medium">{Math.floor(entry.duration / 60)}min</p>
                        </div>
                      </div>

                      {entry.questions && entry.questions.length > 0 && (
                        <details className="mt-4">
                          <summary className="cursor-pointer text-sm text-gold-500 hover:text-gold-400">
                            Ver preguntas
                          </summary>
                          <ul className="mt-2 space-y-1 text-sm text-gray-300 ml-4">
                            {entry.questions.map((q, i) => (
                              <li key={i}>• {q}</li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
