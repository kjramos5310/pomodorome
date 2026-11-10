import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Zap, Shuffle, ExternalLink, Pause, Play, Square, Check, ArrowRight, RotateCcw, X } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import HudPanel from '../components/HudPanel'
import { SPARK_TOPICS, exploreLinks } from '../lib/sparkTopics'
import { INITIAL_TOPICS } from './RouletteScreen'
import { SESSION_XP } from '../lib/xp'
import { nextPendingStep, routeSteps } from '../lib/projectStats'
import { useWorld } from '../lib/worldContext'

// ============= CHISPA → EMBRAGUE → MOTOR =============
// Chispa (15–20 min): curiosidad aleatoria; el temporizador corta, no tú.
// Embrague (3–5 min): aparcar la pregunta, forzar un puente con el proyecto, fijar el primer paso.
// Motor (60–90 min): deep work en el proyecto. Al cerrar, defines el primer paso de la próxima vez.
// Los proyectos se intercalan: siempre sugiere el que lleva más tiempo sin tocarse.

const cut = (n) => `polygon(${n}px 0%, 100% 0%, 100% calc(100% - ${n}px), calc(100% - ${n}px) 100%, 0% 100%, 0% ${n}px)`
const EMBRAGUE_MIN = 4
const PHASES = [
  { id: 'chispa', label: 'Chispa', emoji: '⚡', color: '#facc15' },
  { id: 'embrague', label: 'Embrague', emoji: '⚙️', color: '#22d3ee' },
  { id: 'motor', label: 'Motor', emoji: '🔥', color: '#f97316' },
]

const fmt = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

// ── Sonido: un solo AudioContext compartido ──
let audioCtx = null
function beep(times = 2) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    audioCtx = audioCtx || new Ctx()
    for (let i = 0; i < times; i++) {
      const t = audioCtx.currentTime + i * 0.35
      const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain()
      osc.type = 'triangle'; osc.frequency.value = i === times - 1 ? 880 : 660
      gain.gain.setValueAtTime(0.15, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
      osc.connect(gain); gain.connect(audioCtx.destination); osc.start(t); osc.stop(t + 0.3)
    }
  } catch (err) { console.warn('beep', err) }
}

// ── Banco de temas ──
function topicPool(source) {
  let roulette = INITIAL_TOPICS
  try {
    const saved = JSON.parse(localStorage.getItem('pomodoro_roulette_topics'))
    if (Array.isArray(saved) && saved.length) roulette = saved
  } catch { /* usar el banco por defecto */ }
  const r = roulette.map(t => ({ ...t, hook: t.questions?.[0] || '', keywords: t.keywords || [] }))
  if (source === 'roulette') return r
  if (source === 'all') return [...SPARK_TOPICS, ...r]
  return SPARK_TOPICS
}
const pickTopic = (source, excludeId) => {
  const pool = topicPool(source).filter(t => t.id !== excludeId)
  return pool[Math.floor(Math.random() * pool.length)]
}

// ── Rotación: proyecto en curso que lleva más tiempo sin sesiones ──
function rotation(projects, history) {
  const active = projects.filter(p => (p.status || 'in_progress') === 'in_progress')
  const pool = active.length ? active : projects.filter(p => p.status !== 'done')
  const last = {}
  history.forEach(e => {
    const t = new Date(e.date).getTime()
    if (!last[e.projectId] || t > last[e.projectId]) last[e.projectId] = t
  })
  return [...pool].sort((a, b) => (last[a.id] || 0) - (last[b.id] || 0)).map(p => ({ ...p, lastAt: last[p.id] || null }))
}
const daysAgo = (t, now) => {
  if (!t) return 'nunca'
  const d = Math.floor((now - t) / 86400000)
  return d === 0 ? 'hoy' : d === 1 ? 'ayer' : `hace ${d} días`
}

export default function IgnitionScreen({ projects, history, onCompleteCycle, onUpdateProject }) {
  const theme = useWorld()
  // La fase Motor toma el color del mundo del proyecto activo
  const phases = PHASES.map(p => (p.id === 'motor' ? { ...p, color: theme.accent } : p))
  const phaseMeta = (id) => phases.find(p => p.id === id) || phases[2]
  const [ig, setIg] = useLocalStorage('ignition_state', { phase: 'setup' })
  const [nextSteps, setNextSteps] = useLocalStorage('ignition_next_steps', {})
  const [prefs, setPrefs] = useLocalStorage('ignition_prefs', { chispaMin: 15, motorMin: 75, source: 'spark' })
  const [pickId, setPickId] = useState(null)
  const [now, setNow] = useState(() => Date.now())
  const [distraction, setDistraction] = useState('')

  const igRef = useRef(ig)
  useEffect(() => { igRef.current = ig })

  const order = rotation(projects, history)
  const selectedId = pickId && order.some(p => p.id === pickId) ? pickId : order[0]?.id
  const project = projects.find(p => p.id === (ig.phase === 'setup' ? selectedId : ig.projectId))
  const patch = (obj) => setIg(prev => ({ ...prev, ...obj }))

  // Primer paso sugerido: el arranque guardado en el último cierre (si no se marcó ya como hecho
  // en la ruta) o, si no hay, el siguiente paso pendiente de la ruta del proyecto
  const suggestedFirstStep = (p) => {
    if (!p) return ''
    const saved = nextSteps[p.id]
    const doneInRoute = saved && routeSteps(p).some(s => s.done && s.text === saved)
    if (saved && !doneInRoute) return saved
    return nextPendingStep(p)?.text || ''
  }

  // ── Reloj: cortes automáticos de la chispa y del motor ──
  useEffect(() => {
    const id = setInterval(() => {
      const t = Date.now()
      setNow(t)
      const cur = igRef.current
      if (cur.phase === 'chispa' && t >= cur.endsAt) {
        beep(3)
        setIg({ ...cur, phase: 'embrague', cutAt: t, endsAt: t + EMBRAGUE_MIN * 60000 })
      } else if (cur.phase === 'motor' && !cur.pausedAt && t >= cur.endsAt) {
        beep(4)
        setIg({ ...cur, phase: 'cierre', motorSeconds: cur.motorMin * 60, motorEndedAt: cur.endsAt })
      }
    }, 1000)
    return () => clearInterval(id)
  }, [setIg])

  const remaining = ig.pausedAt ? ig.endsAt - ig.pausedAt : (ig.endsAt || 0) - now

  // ── Acciones ──
  const start = () => {
    const t = Date.now()
    setIg({
      phase: 'chispa', projectId: selectedId, topic: pickTopic(prefs.source), rerolled: false,
      chispaMin: prefs.chispaMin, motorMin: prefs.motorMin, startedAt: t, endsAt: t + prefs.chispaMin * 60000,
      notes: '', parked: '', bridge: '', firstStep: suggestedFirstStep(projects.find(x => x.id === selectedId)), tabsClosed: false, distractions: [], completedStepIds: [],
    })
  }
  const reroll = () => { if (!ig.rerolled) patch({ topic: pickTopic(prefs.source, ig.topic?.id), rerolled: true }) }
  const startMotor = () => {
    const t = Date.now()
    patch({ phase: 'motor', motorStartedAt: t, endsAt: t + ig.motorMin * 60000, pausedAt: null, pausedTotal: 0 })
  }
  const togglePause = () => {
    if (ig.pausedAt) {
      const d = Date.now() - ig.pausedAt
      patch({ pausedAt: null, endsAt: ig.endsAt + d, pausedTotal: (ig.pausedTotal || 0) + d })
    } else patch({ pausedAt: Date.now() })
  }
  const endMotorEarly = () => {
    if (!window.confirm('¿Apagar el motor ahora? Se guardan los minutos que llevas.')) return
    const t = Date.now()
    const paused = (ig.pausedTotal || 0) + (ig.pausedAt ? t - ig.pausedAt : 0)
    patch({ phase: 'cierre', pausedAt: null, motorEndedAt: t, motorSeconds: Math.max(0, Math.round((t - ig.motorStartedAt - paused) / 1000)) })
  }
  const abort = () => {
    const msg = ig.phase === 'motor' ? '¿Abandonar el ciclo sin guardar? (Para guardar los minutos usa "Apagar motor")' : '¿Abandonar este ciclo?'
    if (window.confirm(msg)) setIg({ phase: 'setup' })
  }
  const addDistraction = () => {
    if (!distraction.trim()) return
    patch({ distractions: [...(ig.distractions || []), distraction.trim()] })
    setDistraction('')
  }

  const saveCycle = () => {
    const p = projects.find(x => x.id === ig.projectId)
    const lines = [
      `⚡ Chispa: ${ig.topic?.title} (${ig.chispaMin} min)`,
      ig.notes?.trim() && `Apuntes de la chispa:\n${ig.notes.trim()}`,
      ig.parked && `🅿️ Aparcado: ${ig.parked}`,
      ig.bridge && `🌉 Puente: ${ig.bridge}`,
      ig.distractions?.length && `🧠 Distracciones anotadas: ${ig.distractions.join(' · ')}`,
      ig.nextStep?.trim() && `➡️ Próximo paso: ${ig.nextStep.trim()}`,
    ].filter(Boolean)
    onCompleteCycle({
      id: Date.now().toString(),
      type: 'ignition',
      date: new Date(ig.motorEndedAt || Date.now()).toISOString(),
      projectId: ig.projectId,
      projectName: p?.name || 'Proyecto',
      projectEmoji: p?.emoji,
      projectFocus: p?.focus,
      mood: null,
      deepworksCompleted: 1,
      deepworksPlanned: 1,
      duration: ig.motorSeconds || 0,
      xpGained: SESSION_XP,
      questions: ig.parked ? [ig.parked] : [],
      distractions: ig.distractions || [],
      synthesis: ig.bridge ? { explanation: ig.bridge } : {},
      evidence: {},
      sessionObjective: ig.firstStep,
      notes: lines.join('\n'),
    })
    // Pasos de la ruta completados en este ciclo
    if (p && ig.completedStepIds?.length && onUpdateProject) {
      const at = new Date().toISOString()
      onUpdateProject({ ...p, steps: routeSteps(p).map(st => ig.completedStepIds.includes(st.id) ? { ...st, done: true, doneAt: at } : st) })
    }
    // El próximo paso queda listo para la próxima vez que toque este proyecto
    setNextSteps(prev => {
      const n = { ...prev }
      if (ig.nextStep?.trim()) n[ig.projectId] = ig.nextStep.trim(); else delete n[ig.projectId]
      return n
    })
    patch({ phase: 'done' })
  }

  const nextCycle = () => { setPickId(null); setIg({ phase: 'setup' }) }

  // ── Render ──
  const meta = phaseMeta(ig.phase)
  const inCycle = ['chispa', 'embrague', 'motor'].includes(ig.phase)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-full pt-24 pb-12 px-4 sm:px-6 relative text-white"
      style={{ background: 'var(--bg)', fontFamily: "'Rajdhani', sans-serif" }}
    >
      <div className="hud-scanline" />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse 60% 45% at 50% 30%, ${inCycle ? meta.color : theme.accent}14 0%, transparent 70%)`
      }} />

      <div className="max-w-xl mx-auto flex flex-col gap-5 relative z-10">
        {/* ── Título + barra de fases ── */}
        <div>
          <p className="hud-label" style={{ color: 'rgba(var(--accent-rgb),0.5)' }}>// SECUENCIA_DE_IGNICIÓN</p>
          <h1 className="hud-title text-3xl mt-1 flex items-center gap-2">
            <Zap size={26} className="text-yellow-400" /> Chispa → Motor
          </h1>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {phases.map((ph, i) => {
            const idx = phases.findIndex(p => p.id === ig.phase)
            const done = ['cierre', 'done'].includes(ig.phase) || (idx > i)
            const current = ig.phase === ph.id
            const mins = ph.id === 'chispa' ? (ig.chispaMin || prefs.chispaMin) : ph.id === 'embrague' ? EMBRAGUE_MIN : (ig.motorMin || prefs.motorMin)
            return (
              <div key={ph.id} className="px-2 py-2 border text-center" style={{
                clipPath: cut(5),
                borderColor: current ? ph.color : done ? `${ph.color}55` : 'rgba(255,255,255,0.06)',
                background: current ? `${ph.color}18` : 'transparent',
              }}>
                <p className="text-sm font-bold" style={{ color: current || done ? ph.color : '#6b7280' }}>
                  {done && !current ? '✓' : ph.emoji} {ph.label}
                </p>
                <p className="font-mono text-[9px] text-gray-500">{mins} min</p>
              </div>
            )
          })}
        </div>

        {/* Cambio de fase instantáneo: no depende de que termine una animación de salida */}
        <div>
          {/* ════════ SETUP ════════ */}
          {ig.phase === 'setup' && (
            <motion.div key="setup" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5">
              {order.length === 0 ? (
                <HudPanel title="SIN_PROYECTOS" mod="IGN" id="0" dotStatus="idle">
                  <p className="text-sm text-gray-400">Necesitas al menos un proyecto en curso para el motor. Créalo en la sección Proyectos.</p>
                </HudPanel>
              ) : (
                <HudPanel title="MOTOR_DE_HOY" mod="ROTACIÓN" id={`${order.length}P`} dotStatus="active">
                  <p className="hud-label mb-2">// Se intercalan: primero el que lleva más tiempo sin tocarse</p>
                  <div className="space-y-1.5">
                    {order.map((p, i) => {
                      const on = p.id === selectedId
                      return (
                        <button key={p.id} onClick={() => setPickId(p.id)}
                          className="w-full flex items-center gap-3 px-2.5 py-2 text-left border transition-colors"
                          style={{ clipPath: cut(6), borderColor: on ? 'var(--accent)' : 'rgba(255,255,255,0.05)', background: on ? 'rgba(var(--accent-rgb),0.08)' : 'transparent' }}>
                          <span className="text-xl">{p.emoji}</span>
                          <span className="flex-1 min-w-0">
                            <span className={`block text-sm font-semibold truncate ${on ? 'text-white' : 'text-gray-400'}`}>{p.name}</span>
                            <span className="block font-mono text-[9px] tracking-wider text-gray-500">ÚLTIMA SESIÓN: {daysAgo(p.lastAt, now).toUpperCase()}</span>
                          </span>
                          {i === 0 && <span className="font-mono text-[8px] px-1.5 py-0.5 border border-orange-500/40 text-orange-400 flex-shrink-0">TOCA</span>}
                        </button>
                      )
                    })}
                  </div>
                  {project && (
                    <div className="mt-3 p-3 border border-orange-500/15 bg-black/40" style={{ clipPath: cut(6) }}>
                      <p className="hud-label text-[9px] text-orange-400/70">// PRIMER PASO EN {project.name.toUpperCase()}</p>
                      <p className="text-sm text-gray-200 mt-0.5">
                        {suggestedFirstStep(project) || <span className="text-gray-500">Aún no definido: lo fijarás en el embrague (o añade pasos a su ruta en Proyectos).</span>}
                      </p>
                    </div>
                  )}
                </HudPanel>
              )}

              <HudPanel title="AJUSTES" mod="IGN-CFG" id="T" dotStatus="standby">
                {[
                  { key: 'chispaMin', label: 'Chispa', opts: [15, 20], color: '#facc15' },
                  { key: 'motorMin', label: 'Motor', opts: [60, 75, 90], color: theme.accent },
                ].map(row => (
                  <div key={row.key} className="flex items-center gap-2 mb-2">
                    <span className="w-16 text-xs font-mono uppercase text-gray-400">{row.label}</span>
                    {row.opts.map(m => (
                      <button key={m} onClick={() => setPrefs(p => ({ ...p, [row.key]: m }))}
                        className="flex-1 py-1.5 text-xs font-mono border"
                        style={{ clipPath: cut(4), borderColor: prefs[row.key] === m ? row.color : 'rgba(255,255,255,0.08)', color: prefs[row.key] === m ? row.color : '#6b7280' }}>
                        {m} min
                      </button>
                    ))}
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <span className="w-16 text-xs font-mono uppercase text-gray-400">Temas</span>
                  {[['spark', 'Curiosidades'], ['roulette', 'Ruleta'], ['all', 'Ambos']].map(([v, l]) => (
                    <button key={v} onClick={() => setPrefs(p => ({ ...p, source: v }))}
                      className="flex-1 py-1.5 text-xs font-mono border"
                      style={{ clipPath: cut(4), borderColor: prefs.source === v ? '#facc15' : 'rgba(255,255,255,0.08)', color: prefs.source === v ? '#facc15' : '#6b7280' }}>
                      {l}
                    </button>
                  ))}
                </div>
              </HudPanel>

              <button
                onClick={start}
                disabled={!selectedId}
                className="w-full py-4 font-extrabold text-sm tracking-[0.2em] uppercase text-black flex items-center justify-center gap-2 disabled:opacity-30"
                style={{ clipPath: cut(10), background: 'linear-gradient(135deg, #facc15, var(--accent))', boxShadow: '0 0 24px rgba(250,204,21,0.25)' }}
              >
                <Zap size={18} /> Encender chispa
              </button>
            </motion.div>
          )}

          {/* ════════ CHISPA ════════ */}
          {ig.phase === 'chispa' && ig.topic && (
            <motion.div key="chispa" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
              <BigTimer ms={remaining} color={meta.color} total={ig.chispaMin * 60000} caption="EL RELOJ CORTA, NO TÚ" />

              <div className="p-4 border" style={{ clipPath: cut(10), borderColor: `${meta.color}55`, background: `${meta.color}0d` }}>
                <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: meta.color }}>{ig.topic.emoji} {ig.topic.category}</p>
                <h2 className="text-2xl font-bold leading-tight mt-1">{ig.topic.title}</h2>
                {ig.topic.hook && <p className="text-sm text-gray-300 mt-2 leading-relaxed">{ig.topic.hook}</p>}
                {ig.topic.source && <p className="text-xs font-mono text-gray-500 mt-2">📄 {ig.topic.source}</p>}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {exploreLinks(ig.topic).map(l => (
                    <a key={l.label} href={l.url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono border border-white/10 text-gray-300 hover:border-yellow-400/60 hover:text-yellow-300"
                      style={{ clipPath: cut(4) }}>
                      {l.label} <ExternalLink size={11} />
                    </a>
                  ))}
                </div>
                {!ig.rerolled && (
                  <button onClick={reroll} className="mt-3 flex items-center gap-1.5 text-[11px] font-mono uppercase text-gray-500 hover:text-yellow-300">
                    <Shuffle size={12} /> Otro tema (solo 1 vez)
                  </button>
                )}
              </div>

              <div>
                <p className="hud-label mb-1">// Apuntes rápidos (opcional)</p>
                <textarea value={ig.notes || ''} onChange={e => patch({ notes: e.target.value })} rows={4}
                  placeholder="Lo que te llame la atención…"
                  className="w-full p-3 bg-black/50 border border-white/10 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-yellow-400/50 resize-none"
                  style={{ clipPath: cut(6) }} />
              </div>
            </motion.div>
          )}

          {/* ════════ EMBRAGUE ════════ */}
          {ig.phase === 'embrague' && (
            <motion.div key="embrague" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
              {ig.cutAt && now - ig.cutAt < 15000 && (
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="p-3 text-center border border-yellow-400/50 bg-yellow-400/10" style={{ clipPath: cut(8) }}>
                  <p className="font-bold text-yellow-300">⏱ CORTE.</p>
                  <p className="text-sm text-gray-300">¿Te quedaste picado? Perfecto: eso era el objetivo.</p>
                </motion.div>
              )}

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">Cambio de marcha: tres líneas y cierras la chispa.</p>
                <span className="font-mono text-lg font-bold" style={{ color: remaining > 0 ? meta.color : '#9ca3af' }}>{remaining > 0 ? fmt(remaining) : 'listo'}</span>
              </div>

              <ClutchField n="1" title="Aparcar" color={meta.color}
                help="La pregunta que te quedó abierta. Escrita, tu cerebro sabe que no se perdió y la suelta."
                placeholder={`¿…? (sobre ${ig.topic?.title || 'la chispa'})`}
                value={ig.parked} onChange={v => patch({ parked: v })} />
              <ClutchField n="2" title="Puente" color={meta.color}
                help={`Fuerza una conexión con ${project?.name || 'tu proyecto'}, aunque sea absurda.`}
                placeholder="Ej: el moho resuelve rutas cortas → eso es lo que hace Dijkstra"
                value={ig.bridge} onChange={v => patch({ bridge: v })} />
              <ClutchField n="3" title="Primer paso" color={meta.color}
                help={nextSteps[ig.projectId] ? 'Lo definiste la última vez. Ajústalo si hace falta.' : 'La acción concreta con la que arrancas el motor.'}
                placeholder="Ej: implementar la función de distancia y probarla con 3 nodos"
                value={ig.firstStep} onChange={v => patch({ firstStep: v })}>
                {routeSteps(project).filter(st => !st.done).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="font-mono text-[9px] text-gray-500 self-center">RUTA:</span>
                    {routeSteps(project).filter(st => !st.done).slice(0, 3).map(st => (
                      <button key={st.id} onClick={() => patch({ firstStep: st.text })}
                        className="px-2 py-1 text-[11px] border text-left"
                        style={{ clipPath: cut(3), borderColor: ig.firstStep === st.text ? meta.color : 'rgba(255,255,255,0.1)', color: ig.firstStep === st.text ? meta.color : '#9ca3af' }}>
                        {st.text}
                      </button>
                    ))}
                  </div>
                )}
              </ClutchField>

              <button onClick={() => patch({ tabsClosed: !ig.tabsClosed })}
                className="flex items-center gap-3 p-3 border text-left"
                style={{ clipPath: cut(6), borderColor: ig.tabsClosed ? '#22c55e' : 'rgba(255,255,255,0.1)', background: ig.tabsClosed ? 'rgba(34,197,94,0.08)' : 'transparent' }}>
                <span className="w-5 h-5 flex items-center justify-center border flex-shrink-0"
                  style={{ borderColor: ig.tabsClosed ? '#22c55e' : '#4b5563', background: ig.tabsClosed ? '#22c55e' : 'transparent' }}>
                  {ig.tabsClosed && <Check size={13} className="text-black" />}
                </span>
                <span className="text-sm text-gray-200">Cerré todas las pestañas de la chispa</span>
              </button>

              {(() => {
                const missing = [!ig.parked?.trim() && 'aparcar', !ig.bridge?.trim() && 'puente', !ig.firstStep?.trim() && 'primer paso', !ig.tabsClosed && 'cerrar pestañas'].filter(Boolean)
                return (
                  <>
                    <button onClick={startMotor} disabled={missing.length > 0}
                      className="w-full py-4 font-extrabold text-sm tracking-[0.2em] uppercase text-black flex items-center justify-center gap-2 disabled:opacity-30"
                      style={{ clipPath: cut(10), background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}>
                      🔥 Arrancar motor ({ig.motorMin} min) <ArrowRight size={16} />
                    </button>
                    {missing.length > 0 && <p className="text-center font-mono text-[10px] text-gray-500">// Falta: {missing.join(' · ')}</p>}
                  </>
                )
              })()}
            </motion.div>
          )}

          {/* ════════ MOTOR ════════ */}
          {ig.phase === 'motor' && (
            <motion.div key="motor" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
              <p className="text-center font-mono text-xs uppercase tracking-widest text-gray-400">{project?.emoji} {project?.name}</p>
              <BigTimer ms={remaining} color={meta.color} total={ig.motorMin * 60000} caption={ig.pausedAt ? '❚❚ EN PAUSA' : '// DEEP WORK'} />

              <div className="p-4 border-2 text-center" style={{ clipPath: cut(10), borderColor: 'var(--accent)', background: 'rgba(var(--accent-rgb),0.07)' }}>
                <p className="hud-label text-orange-400/80">// PRIMER PASO</p>
                <p className="text-xl font-bold mt-1 leading-snug">{ig.firstStep}</p>
                {ig.bridge && <p className="text-xs text-gray-500 mt-2">🌉 {ig.bridge}</p>}
              </div>

              <div>
                <p className="hud-label mb-1">// ¿Te cruzó otra idea? Anótala y sigue</p>
                <div className="flex gap-2">
                  <input value={distraction} onChange={e => setDistraction(e.target.value)} onKeyDown={e => e.key === 'Enter' && addDistraction()}
                    placeholder="Distracción, idea, pendiente…"
                    className="flex-1 p-2.5 bg-black/50 border border-white/10 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-orange-500/50"
                    style={{ clipPath: cut(4) }} />
                  <button onClick={addDistraction} className="px-3 text-xs font-mono uppercase border border-blue-400/40 text-blue-300" style={{ clipPath: cut(4) }}>Anotar</button>
                </div>
                {ig.distractions?.length > 0 && (
                  <p className="font-mono text-[10px] text-gray-500 mt-1">// {ig.distractions.length} anotada(s): quedan guardadas con el ciclo</p>
                )}
              </div>

              <div className="flex gap-2">
                <button onClick={togglePause} className="flex-1 py-3 text-xs font-bold uppercase tracking-wider border border-orange-500/40 text-orange-400 flex items-center justify-center gap-2" style={{ clipPath: cut(6) }}>
                  {ig.pausedAt ? <><Play size={14} /> Reanudar</> : <><Pause size={14} /> Pausa</>}
                </button>
                <button onClick={endMotorEarly} className="flex-1 py-3 text-xs font-bold uppercase tracking-wider border border-white/10 text-gray-400 flex items-center justify-center gap-2" style={{ clipPath: cut(6) }}>
                  <Square size={12} /> Apagar motor
                </button>
              </div>
            </motion.div>
          )}

          {/* ════════ CIERRE ════════ */}
          {ig.phase === 'cierre' && (
            <motion.div key="cierre" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
              <HudPanel title="MOTOR_APAGADO" mod="CIERRE" id={`${Math.round((ig.motorSeconds || 0) / 60)}M`} dotStatus="active" stripeColor="#22c55e">
                <p className="text-3xl hud-value text-orange-400">{Math.round((ig.motorSeconds || 0) / 60)} min</p>
                <p className="text-sm text-gray-400">de deep work en {project?.emoji} {project?.name}</p>
              </HudPanel>

              {routeSteps(project).filter(st => !st.done).length > 0 && (
                <div>
                  <p className="text-sm font-bold">✅ ¿Completaste algún paso de la ruta?</p>
                  <div className="space-y-1 mt-1.5">
                    {routeSteps(project).filter(st => !st.done).slice(0, 6).map(st => {
                      const on = (ig.completedStepIds || []).includes(st.id)
                      return (
                        <button key={st.id}
                          onClick={() => patch({ completedStepIds: on ? ig.completedStepIds.filter(x => x !== st.id) : [...(ig.completedStepIds || []), st.id] })}
                          className="w-full flex items-center gap-2 p-2 border text-left text-sm"
                          style={{ clipPath: cut(4), borderColor: on ? '#22c55e' : 'rgba(255,255,255,0.08)', background: on ? 'rgba(34,197,94,0.08)' : 'transparent' }}>
                          <span className="w-4 h-4 flex items-center justify-center border flex-shrink-0" style={{ borderColor: on ? '#22c55e' : '#4b5563', background: on ? '#22c55e' : 'transparent' }}>
                            {on && <Check size={11} className="text-black" />}
                          </span>
                          <span className={on ? 'text-gray-400 line-through' : 'text-gray-200'}>{st.text}</span>
                          {st.text === ig.firstStep && <span className="ml-auto font-mono text-[9px] text-orange-400 flex-shrink-0">TU PRIMER PASO</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm font-bold">➡️ ¿Con qué arrancas la próxima vez en {project?.name}?</p>
                <p className="text-xs text-gray-500 mb-1.5">Queda guardado: el próximo embrague ya lo tendrá escrito.</p>
                <input autoFocus value={ig.nextStep || ''} onChange={e => patch({ nextStep: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && saveCycle()}
                  placeholder="Una acción concreta y pequeña"
                  className="w-full p-3 bg-black/50 border border-orange-500/30 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500"
                  style={{ clipPath: cut(6) }} />
                {(() => {
                  const upcoming = routeSteps(project).find(st => !st.done && !(ig.completedStepIds || []).includes(st.id))
                  return upcoming && ig.nextStep !== upcoming.text && (
                    <button onClick={() => patch({ nextStep: upcoming.text })} className="mt-1.5 text-xs text-gray-400 hover:text-orange-400 text-left">
                      ↳ Usar el siguiente de la ruta: <span className="text-gray-200">{upcoming.text}</span>
                    </button>
                  )
                })()}
              </div>

              {ig.parked && (
                <p className="text-xs text-gray-500">🅿️ Tu pregunta aparcada se guarda en el historial: <span className="text-gray-300">"{ig.parked}"</span></p>
              )}

              <button onClick={saveCycle}
                className="w-full py-4 font-extrabold text-sm tracking-[0.2em] uppercase text-black flex items-center justify-center gap-2"
                style={{ clipPath: cut(10), background: '#22c55e' }}>
                <Check size={18} /> Guardar ciclo
              </button>
            </motion.div>
          )}

          {/* ════════ DONE ════════ */}
          {ig.phase === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col gap-4 text-center">
              <div className="py-6">
                <p className="text-5xl">🔥</p>
                <p className="text-2xl font-bold mt-2">Ciclo completo</p>
                <p className="font-mono text-sm text-orange-400 mt-1">+{SESSION_XP} XP · guardado en el historial</p>
              </div>
              {order[0] && (
                <button onClick={nextCycle}
                  className="w-full py-4 font-extrabold text-sm tracking-[0.15em] uppercase text-black flex items-center justify-center gap-2"
                  style={{ clipPath: cut(10), background: 'linear-gradient(135deg, #facc15, var(--accent))' }}>
                  <RotateCcw size={16} /> Otro ciclo → {order[0].emoji} {order[0].name}
                </button>
              )}
              <button onClick={() => setIg({ phase: 'setup' })} className="text-sm font-mono uppercase text-gray-500 hover:text-gray-300">
                Terminar por hoy
              </button>
            </motion.div>
          )}
        </div>

        {/* Abandonar el ciclo (dentro del contenido para no tapar botones) */}
        {inCycle && (
          <button onClick={abort}
            className="self-center flex items-center gap-1.5 px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-gray-600 hover:text-orange-400"
            aria-label="Abandonar ciclo">
            <X size={11} /> Abandonar ciclo
          </button>
        )}
      </div>
    </motion.div>
  )
}

// ─── Temporizador grande con anillo ───────────────────────────────────────
function BigTimer({ ms, total, color, caption }) {
  const r = 100, c = 2 * Math.PI * r
  const progress = total ? Math.min(1, Math.max(0, 1 - ms / total)) : 0
  return (
    <div className="relative mx-auto" style={{ width: 230, height: 230 }}>
      <svg viewBox="0 0 230 230" className="absolute inset-0">
        <circle cx="115" cy="115" r={r} fill="none" stroke={`${color}1a`} strokeWidth="8" />
        <circle cx="115" cy="115" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={c} strokeDashoffset={c * (1 - progress)} transform="rotate(-90 115 115)"
          style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: 'stroke-dashoffset 1s linear' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold" style={{ fontFamily: "'Orbitron', sans-serif", color, textShadow: `0 0 20px ${color}88` }}>{fmt(ms)}</span>
        <span className="hud-label text-[9px] mt-1" style={{ color: `${color}aa` }}>{caption}</span>
      </div>
    </div>
  )
}

// ─── Campo del embrague ───────────────────────────────────────────────────
function ClutchField({ n, title, help, placeholder, value, onChange, color, children }) {
  const done = !!value?.trim()
  return (
    <div className="p-3 border" style={{ clipPath: cut(8), borderColor: done ? `${color}66` : 'rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.4)' }}>
      <div className="flex items-center gap-2 mb-1">
        <span className="w-5 h-5 flex items-center justify-center text-[11px] font-bold text-black flex-shrink-0" style={{ background: done ? color : '#4b5563' }}>
          {done ? '✓' : n}
        </span>
        <span className="font-bold">{title}</span>
      </div>
      <p className="text-xs text-gray-500 mb-2">{help}</p>
      <textarea value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={2}
        className="w-full p-2.5 bg-black/60 border border-white/10 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-white/30 resize-none"
        style={{ clipPath: cut(4) }} />
      {children}
    </div>
  )
}
