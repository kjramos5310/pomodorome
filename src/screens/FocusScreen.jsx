import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Check, Square } from 'lucide-react'
import HudPanel from '../components/HudPanel'
import MiniConfetti from '../components/MiniConfetti'

// 6. FOCUS SCREEN
export default function FocusScreen({ mood, duration, questions, currentQuestionIndex, completedQuestions, onAddQuestion, onCompleteQuestion, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [showAddQuestion, setShowAddQuestion] = useState(false)
  const [newQuestion, setNewQuestion] = useState('')
  const [showInbox, setShowInbox] = useState(false)
  const [inboxText, setInboxText] = useState('')
  const [inboxItems, setInboxItems] = useState([])
  const [showConfetti, setShowConfetti] = useState(false)
  const [bgAudio, setBgAudio] = useState("")
  const audioRef = useRef(null)
  const endTimeRef = useRef(Date.now() + duration * 1000)
  const isCompletingRef = useRef(false)

  useEffect(() => {
    if (audioRef.current) {
      if (bgAudio) {
        audioRef.current.src = bgAudio
        audioRef.current.volume = 0.4
        audioRef.current.play().catch(e => console.log('Audio play error:', e))
      } else {
        audioRef.current.pause()
      }
    }
  }, [bgAudio])

  // Temporizador basado en tiempo absoluto
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000))
      setTimeLeft(remaining)
      if (remaining <= 0) clearInterval(timer)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Cerrar el bloque (por tiempo o porque tú lo decides). Guarda los minutos reales.
  const finish = () => {
    if (isCompletingRef.current) return
    isCompletingRef.current = true
    const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000))
    onComplete({
      duration: duration - remaining,
      questionsAnswered: completedQuestions.length,
      inboxItems: inboxItems
    })
  }
  const finishRef = useRef(finish)
  useEffect(() => { finishRef.current = finish })

  // El bloque solo se cierra solo cuando se acaba el tiempo
  useEffect(() => {
    if (timeLeft <= 0) finishRef.current()
  }, [timeLeft])

  // Completar todas las preguntas ya NO corta el bloque: te deja elegir
  const allDone = questions.length > 0 && questions.every((_, i) => completedQuestions.includes(i))

  const progress = ((duration - timeLeft) / duration) * 100
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  const handleCompleteQuestion = () => {
    // Sonido de recompensa (pop/ding de cristal)
    const sound = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3')
    sound.play().catch(e => console.log(e))

    // Confeti
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 2000)

    onCompleteQuestion()
  }

  const handleAddQuestion = () => {
    if (newQuestion.trim()) {
      onAddQuestion(newQuestion)
      setNewQuestion('')
      setShowAddQuestion(false)
    }
  }

  const handleAddInbox = (e) => {
    e.preventDefault();
    if (inboxText.trim()) {
      setInboxItems(prev => [...prev, inboxText.trim()]);
      setInboxText('');
      setShowInbox(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-full flex flex-col"
      style={{ background: 'var(--bg)', fontFamily: "'Rajdhani', sans-serif" }}
    >
      <audio ref={audioRef} loop playsInline />
      {showConfetti && <MiniConfetti />}

      {/* Scanline overlay */}
      <div className="hud-scanline" />

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(var(--accent-rgb),0.05) 0%, transparent 70%)'
      }} />

      {/* Header */}
      <div className="flex items-center justify-between px-4 h-[44px] shrink-0 border-b border-orange-500/10 z-10"
        style={{ background: 'rgba(var(--accent-rgb),0.03)' }}>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded" style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            boxShadow: '0 0 10px rgba(var(--accent-rgb),0.5)'
          }} />
          <div className="flex flex-col">
            <span className="hud-title text-white text-xs tracking-widest leading-none">SESIÓN DE ENFOQUE</span>
            <span className="hud-label text-[8px] mt-0.5 leading-none" style={{ color: 'rgba(var(--accent-rgb),0.5)' }}>
              TAREA {currentQuestionIndex + 1} DE {questions.length}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 relative">
          {/* Selector de ruido blanco en modo HUD */}
          <div className="relative">
            <select
              className="bg-neutral-950/85 text-[10px] py-1 px-3 rounded-none text-orange-400 focus:outline-none border border-orange-500/30 appearance-none text-center cursor-pointer hover:border-orange-500/60 transition-colors uppercase"
              style={{ fontFamily: "'Share Tech Mono', monospace", letterSpacing: '0.08em' }}
              value={bgAudio}
              onChange={(e) => setBgAudio(e.target.value)}
              title="Ruido de fondo"
            >
              <option value="">🔇 SILENCIO</option>
              <option value="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3">🎧 LOFI</option>
              <option value="https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg">🌧️ LLUVIA</option>
              <option value="https://actions.google.com/sounds/v1/water/waterfall_medium.ogg">🌊 MARRÓN</option>
            </select>
          </div>
        </div>
      </div>

      {/* Timer & Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-6 z-10">
        
        {/* Circular Timer Dial */}
        <div className="relative my-4 flex items-center justify-center" style={{ width: 256, height: 256 }}>
          <svg viewBox="0 0 256 256" className="absolute inset-0 w-full h-full"
            style={{ filter: 'drop-shadow(0 0 4px rgba(var(--accent-rgb),0.2))' }}>
            {/* Outer glow ring */}
            <circle cx="128" cy="128" r="120" fill="none" stroke="rgba(var(--accent-rgb),0.03)" strokeWidth="16" />
            {/* Track */}
            <circle cx="128" cy="128" r="110" fill="none" stroke="rgba(var(--accent-rgb),0.08)" strokeWidth="8" />
            {/* 36 tick marks */}
            {Array.from({ length: 36 }).map((_, i) => {
              const angle = (i / 36) * 360 - 90
              const rad = angle * Math.PI / 180
              const isMajor = i % 6 === 0
              const r1 = 110 - (isMajor ? 8 : 4)
              const r2 = 110 + (isMajor ? 3 : 1)
              return (
                <line
                  key={i}
                  x1={128 + r1 * Math.cos(rad)} y1={128 + r1 * Math.sin(rad)}
                  x2={128 + r2 * Math.cos(rad)} y2={128 + r2 * Math.sin(rad)}
                  stroke={isMajor ? 'rgba(var(--accent-rgb),0.25)' : 'rgba(var(--accent-rgb),0.08)'}
                  strokeWidth={isMajor ? 1.5 : 0.8}
                />
              )
            })}
            {/* Progress arc */}
            <motion.circle
              cx="128" cy="128" r="110"
              fill="none" stroke="var(--accent)" strokeWidth="8" strokeLinecap="butt"
              strokeDasharray={`${2 * Math.PI * 110}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 110 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 110 * (1 - progress / 100) }}
              transition={{ duration: 0.5, ease: 'linear' }}
              transform="rotate(-90 128 128)"
              style={{ filter: 'drop-shadow(0 0 8px rgba(var(--accent-rgb),0.9))' }}
            />
            {/* Inner decorative ring */}
            <circle cx="128" cy="128" r="95" fill="none" stroke="rgba(var(--accent-rgb),0.05)" strokeWidth="1" strokeDasharray="5 5" />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="hud-number text-5xl font-bold tracking-wider"
              style={{
                color: 'var(--accent)',
                textShadow: '0 0 20px rgba(var(--accent-rgb),0.6), 0 0 40px rgba(var(--accent-rgb),0.2)',
                fontFamily: "'Orbitron', sans-serif"
              }}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="hud-label text-[8px] mt-1" style={{ color: 'rgba(var(--accent-rgb),0.4)', letterSpacing: '0.15em' }}>
              // TIME_REMAINING
            </span>
          </div>
        </div>

        {/* Current Question Styled as HudPanel */}
        <HudPanel title="OBJETIVO_DE_ENFOQUE" mod="DW-T02" id="0048-Q" dotStatus="active" className="w-full max-w-sm mb-6">
          <h3 className="text-xl font-bold text-center text-orange-400 py-2" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            {questions[currentQuestionIndex]}
          </h3>
        </HudPanel>

        {/* Actions Section */}
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <div className="flex gap-3 w-full">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowAddQuestion(true)}
              className="flex-1 flex items-center justify-center gap-2"
              style={{
                padding: '10px 14px',
                background: 'rgba(var(--accent-rgb),0.04)',
                border: '1px solid rgba(var(--accent-rgb),0.3)',
                clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)',
                cursor: 'pointer',
                color: 'var(--accent)'
              }}
            >
              <Plus size={16} />
              <span className="hud-label font-bold text-xs" style={{ color: 'var(--accent)' }}>PREGUNTA</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowInbox(true)}
              className="flex-1 flex items-center justify-center gap-2"
              style={{
                padding: '10px 14px',
                background: 'rgba(59,130,246,0.04)',
                border: '1px solid rgba(59,130,246,0.3)',
                clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)',
                cursor: 'pointer',
                color: '#60a5fa'
              }}
            >
              <Plus size={16} />
              <span className="hud-label font-bold text-xs" style={{ color: '#60a5fa' }}>DISTRACCIÓN</span>
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCompleteQuestion}
            disabled={completedQuestions.includes(currentQuestionIndex)}
            className="w-full flex items-center justify-center gap-2 hud-glow-orange disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              padding: '14px 20px',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              color: '#000',
              fontWeight: 800,
              fontSize: 14,
              letterSpacing: '0.15em',
              clipPath: 'polygon(10px 0%, calc(100% - 10px) 0%, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0% calc(100% - 10px), 0% 10px)',
              cursor: 'pointer'
            }}
          >
            <Check size={18} />
            <span>COMPLETÉ ESTO</span>
          </motion.button>

          {/* Todo completado: ¿seguir o cerrar? */}
          <AnimatePresence>
            {allDone && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 border border-green-500/40 bg-green-500/5 text-center"
                style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}
              >
                <p className="hud-label text-[10px] mb-2" style={{ color: '#4ade80' }}>// TODAS LAS TAREAS LISTAS · TE QUEDAN {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</p>
                <div className="flex gap-2">
                  <button onClick={() => setShowAddQuestion(true)} className="flex-1 py-2 text-xs font-bold uppercase tracking-wider text-orange-400 border border-orange-500/40">
                    + Otra tarea
                  </button>
                  <button onClick={finish} className="flex-1 py-2 text-xs font-bold uppercase tracking-wider text-black bg-green-500">
                    Cerrar bloque
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Terminar antes, guardando los minutos reales */}
          {!allDone && (
            <button
              onClick={() => { if (window.confirm('¿Terminar el bloque ahora? Se guardan los minutos que llevas.')) finish() }}
              className="self-center flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-gray-600 hover:text-orange-400 transition-colors py-1"
            >
              <Square size={10} /> Terminar bloque ahora
            </button>
          )}
        </div>
      </div>

      {/* Add Question Modal */}
      <AnimatePresence>
        {showAddQuestion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-8 z-50"
            onClick={() => setShowAddQuestion(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-neutral-850 p-8 rounded-3xl max-w-md w-full"
            >
              <h3 className="text-2xl font-semibold mb-4">Nueva pregunta</h3>
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="¿Qué quieres investigar?"
                className="w-full p-4 bg-neutral-900 border border-neutral-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 mb-4"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddQuestion(false)}
                  className="flex-1 py-3 bg-neutral-700 hover:bg-neutral-600 rounded-full transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddQuestion}
                  className="flex-1 py-3 bg-gold-500 hover:bg-gold-600 text-black rounded-full transition-colors"
                >
                  Agregar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inbox Modal (Panic Button) */}
      <AnimatePresence>
        {showInbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-8 z-50 backdrop-blur-sm"
            onClick={() => setShowInbox(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-neutral-900 p-8 rounded-3xl max-w-md w-full border border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.15)]"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">💡</span>
                <h3 className="text-2xl font-semibold text-blue-400">Inbox de Distracciones</h3>
              </div>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                Descarga aquí cualquier pensamiento, idea o pendiente que te esté distrayendo. Tu cerebro puede soltarlo; está a salvo aquí.
              </p>

              <form onSubmit={handleAddInbox}>
                <input
                  type="text"
                  value={inboxText}
                  onChange={(e) => setInboxText(e.target.value)}
                  placeholder="Ej: Pagar la luz, escribirle a mamá, buscar vuelo..."
                  className="w-full p-4 bg-neutral-950 border border-neutral-700 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 mb-6 transition-colors"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowInbox(false)}
                    className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 font-medium rounded-full transition-colors"
                  >
                    Descartar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                  >
                    Guardar y Volver
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
