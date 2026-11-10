import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

// ============= OBJECTIVE SCREEN =============
const LEARNING_PHASES = [
  {
    id: 'captura',
    label: 'Captura',
    emoji: '📖',
    desc: 'Lectura superficial → preguntas → apuntes',
    color: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
    activeColor: 'border-blue-500 bg-blue-500/20 text-blue-200',
  },
  {
    id: 'output',
    label: 'Output',
    emoji: '✍️',
    desc: 'Síntesis activa → explicar con tus palabras',
    color: 'border-orange-500/40 bg-orange-500/10 text-orange-300',
    activeColor: 'border-orange-500 bg-orange-500/20 text-orange-200',
  },
  {
    id: 'proceso',
    label: 'Proceso (Anki)',
    emoji: '🧠',
    desc: 'Flashcards → repaso espaciado',
    color: 'border-purple-500/40 bg-purple-500/10 text-purple-300',
    activeColor: 'border-purple-500 bg-purple-500/20 text-purple-200',
  },
]
export default function ObjectiveScreen({ onConfirm, projectName, suggestion }) {
  const [objective, setObjective] = useState('')
  const [phase, setPhase] = useState(null)

  const canContinue = objective.trim().length > 0 && phase !== null

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '-100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 px-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-sm"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-xs text-gold-400 uppercase tracking-widest font-semibold mb-1">
            {projectName && `→ ${projectName}`}
          </p>
          <h2 className="text-3xl font-bold">Intención de sesión</h2>
          <p className="text-gray-400 text-sm mt-1">Define el objetivo antes de entrar en foco</p>
        </div>

        {/* Objective input */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">¿Qué vas a lograr?</p>
          <textarea
            autoFocus
            rows={3}
            value={objective}
            onChange={e => setObjective(e.target.value)}
            placeholder="Ej: Leer cap. 3 de redes y generar 10 preguntas clave…"
            className="w-full p-4 bg-neutral-800 border border-neutral-700 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-gold-500 text-sm resize-none transition-colors"
          />
          {suggestion && objective !== suggestion && (
            <button
              onClick={() => setObjective(suggestion)}
              className="mt-2 w-full text-left px-3 py-2 rounded-xl border border-orange-500/30 bg-orange-500/5 text-sm hover:border-orange-500/60 transition-colors"
            >
              <span className="block text-[10px] font-mono uppercase tracking-widest text-orange-400">▶ Siguiente paso de la ruta</span>
              <span className="text-gray-200">{suggestion}</span>
            </button>
          )}
        </div>

        {/* Learning phase */}
        <div className="mb-8">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Fase de aprendizaje</p>
          <div className="space-y-2">
            {LEARNING_PHASES.map(p => (
              <button
                key={p.id}
                onClick={() => setPhase(p.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${phase === p.id ? p.activeColor : p.color
                  }`}
              >
                <span className="text-2xl flex-shrink-0">{p.emoji}</span>
                <div>
                  <p className="font-semibold text-sm">{p.label}</p>
                  <p className="text-[11px] opacity-70">{p.desc}</p>
                </div>
                {phase === p.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto w-5 h-5 rounded-full bg-current flex items-center justify-center flex-shrink-0"
                  >
                    <Check size={11} className="text-neutral-900" />
                  </motion.div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Confirm */}
        <motion.button
          onClick={() => canContinue && onConfirm(objective.trim(), phase)}
          disabled={!canContinue}
          animate={canContinue ? { scale: [1, 1.02, 1] } : { scale: 1 }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${canContinue
              ? 'bg-gold-500 text-black hover:bg-gold-400 shadow-[0_0_20px_rgba(234,179,8,0.3)]'
              : 'bg-neutral-800 text-gray-600 cursor-not-allowed'
            }`}
        >
          {canContinue ? 'Entrar en foco →' : 'Define objetivo + fase'}
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
