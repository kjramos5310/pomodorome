import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, Plus, X, Check, ListPlus, Trash2, Shuffle, Eye, EyeOff } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { collectIdeas, IDEA_KINDS, hashOf } from '../lib/brainstorm'
import { newStepId } from '../lib/projectStats'

const cut = (n) => `polygon(${n}px 0%, 100% 0%, 100% calc(100% - ${n}px), calc(100% - ${n}px) 100%, 0% 100%, 0% ${n}px)`
const fmtDate = (d) => new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })

// ============= NOTAS · LLUVIA DE IDEAS =============
// Todas las preguntas, preguntas aparcadas, bloqueos e inbox de distracciones de
// todas las sesiones, dispersos como notas sueltas. Se pueden arrastrar, resolver
// o convertir en un paso de la ruta de un proyecto.
export default function NotesScreen({ history, projects, onUpdateProject }) {
  const [manual, setManual] = useLocalStorage('brain_notes', [])
  const [hidden, setHidden] = useLocalStorage('brain_hidden', {})       // id → 'resuelta' | 'convertida'
  const [offsets, setOffsets] = useLocalStorage('brain_offsets', {})    // id → { x, y } tras arrastrar
  const [seed, setSeed] = useLocalStorage('brain_seed', 0)             // "Revolver" cambia la dispersión
  const [kindFilter, setKindFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')
  const [showHidden, setShowHidden] = useState(false)
  const [draft, setDraft] = useState('')
  const [open, setOpen] = useState(null)

  const all = collectIdeas(history, manual)
  const visible = all.filter(i =>
    (kindFilter === 'all' || i.kind === kindFilter) &&
    (projectFilter === 'all' || i.projectId === projectFilter) &&
    (showHidden ? !!hidden[i.id] : !hidden[i.id])
  )
  const countOf = (k) => all.filter(i => !hidden[i.id] && (k === 'all' || i.kind === k)).length
  const projectsWithIdeas = projects.filter(p => all.some(i => i.projectId === p.id && !hidden[i.id]))

  const addNote = () => {
    if (!draft.trim()) return
    setManual(prev => [{ id: `note-${Date.now().toString(36)}`, text: draft.trim(), date: new Date().toISOString(), projectId: projectFilter !== 'all' ? projectFilter : null }, ...prev])
    setDraft('')
  }
  const hide = (id, reason) => { setHidden(prev => ({ ...prev, [id]: reason })); setOpen(null) }
  const unhide = (id) => { setHidden(prev => { const n = { ...prev }; delete n[id]; return n }); setOpen(null) }
  const removeManual = (id) => { setManual(prev => prev.filter(n => n.id !== id)); setOpen(null) }
  const toRoute = (idea, projectId) => {
    const p = projects.find(x => x.id === projectId)
    if (!p) return
    onUpdateProject({ ...p, steps: [...(p.steps || []), { id: newStepId(), text: idea.text, done: false }] })
    hide(idea.id, 'convertida')
  }

  const openIdea = all.find(i => i.id === open)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-full pt-24 pb-12 px-4 sm:px-6 relative text-white overflow-x-hidden"
      style={{ background: 'var(--bg)', fontFamily: "'Rajdhani', sans-serif" }}
    >
      <div className="hud-scanline" />
      {/* Fondo de pizarra: retícula tenue */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{
        backgroundImage: 'linear-gradient(var(--accent) 1px, transparent 1px), linear-gradient(90deg, var(--accent) 1px, transparent 1px)',
        backgroundSize: '32px 32px'
      }} />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* ── Título ── */}
        <div className="flex items-end justify-between gap-3 mb-4 max-w-xl">
          <div>
            <p className="hud-label" style={{ color: 'rgba(var(--accent-rgb),0.5)' }}>// LLUVIA_DE_IDEAS</p>
            <h1 className="hud-title text-3xl mt-1 flex items-center gap-2">
              <Lightbulb size={26} className="text-yellow-400" /> Notas
            </h1>
            <p className="text-xs text-gray-500 font-mono mt-0.5">{countOf('all')} ideas sueltas de todas tus sesiones</p>
          </div>
          <button onClick={() => setSeed(s => s + 1)} className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-gray-400 hover:text-orange-400 border border-orange-500/20" style={{ clipPath: cut(5) }}>
            <Shuffle size={12} /> Revolver
          </button>
        </div>

        {/* ── Captura rápida ── */}
        <div className="flex gap-2 mb-3 max-w-xl">
          <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && addNote()}
            placeholder="Suelta una idea…"
            className="flex-1 p-2.5 bg-black/60 border border-green-500/25 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-green-500/60"
            style={{ clipPath: cut(5) }} />
          <button onClick={addNote} disabled={!draft.trim()} className="px-3 bg-green-500 text-black disabled:opacity-30" style={{ clipPath: cut(5) }} aria-label="Añadir nota">
            <Plus size={16} />
          </button>
        </div>

        {/* ── Filtros ── */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 mb-2">
          {[['all', 'Todas', 'var(--accent)'], ...Object.entries(IDEA_KINDS).map(([k, v]) => [k, v.label, v.color])].map(([k, label, color]) => {
            const on = kindFilter === k
            return (
              <button key={k} onClick={() => setKindFilter(k)}
                className="flex-shrink-0 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider border"
                style={{ clipPath: cut(4), borderColor: on ? color : 'rgba(255,255,255,0.08)', color: on ? '#080808' : color, background: on ? color : 'transparent' }}>
                {label} · {countOf(k)}
              </button>
            )
          })}
          <button onClick={() => setShowHidden(v => !v)}
            className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider border border-white/10 text-gray-400"
            style={{ clipPath: cut(4), background: showHidden ? 'rgba(255,255,255,0.08)' : 'transparent' }}>
            {showHidden ? <EyeOff size={11} /> : <Eye size={11} />} {showHidden ? 'Ver activas' : 'Ver resueltas'}
          </button>
        </div>
        {projectsWithIdeas.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 mb-4">
            {[{ id: 'all', emoji: '◎', name: 'Todos' }, ...projectsWithIdeas].map(p => (
              <button key={p.id} onClick={() => setProjectFilter(p.id)}
                className="flex-shrink-0 px-2.5 py-1 text-xs border max-w-[180px] truncate"
                style={{ clipPath: cut(4), borderColor: projectFilter === p.id ? 'var(--accent)' : 'rgba(255,255,255,0.06)', color: projectFilter === p.id ? '#fff' : '#9ca3af' }}>
                {p.emoji} {p.name}
              </button>
            ))}
          </div>
        )}

        {/* ── Pizarra dispersa ── */}
        {visible.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-4xl mb-2">☁️</p>
            <p className="hud-label">{showHidden ? '// Nada resuelto todavía' : '// La pizarra está vacía'}</p>
            {!showHidden && <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">Aquí caen las preguntas de tus deepworks, lo que aparcas en Chispa → Motor, donde te trabas y tu inbox de distracciones.</p>}
          </div>
        ) : (
          <div className="flex flex-wrap justify-center items-start gap-x-3 gap-y-5 py-4">
            {visible.map((idea, i) => (
              <IdeaNote
                key={idea.id}
                idea={idea}
                index={i}
                seed={seed}
                offset={offsets[idea.id]}
                onOpen={() => setOpen(idea.id)}
                onMoved={(dx, dy) => setOffsets(prev => {
                  const o = prev[idea.id] || { x: 0, y: 0 }
                  return { ...prev, [idea.id]: { x: o.x + dx, y: o.y + dy } }
                })}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Detalle de una nota ── */}
      <AnimatePresence>
        {openIdea && (
          <IdeaDetail
            idea={openIdea}
            projects={projects}
            hiddenReason={hidden[openIdea.id]}
            onClose={() => setOpen(null)}
            onResolve={() => hide(openIdea.id, 'resuelta')}
            onRestore={() => unhide(openIdea.id)}
            onDelete={openIdea.kind === 'nota' ? () => removeManual(openIdea.id) : null}
            onToRoute={(pid) => toRoute(openIdea, pid)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Una nota suelta en la pizarra ────────────────────────────────────────
function IdeaNote({ idea, index, seed, offset, onOpen, onMoved }) {
  const h = hashOf(idea.id + ':' + seed)
  const kind = IDEA_KINDS[idea.kind]
  const rotate = ((h % 9) - 4) * 1.1                      // -4.4° a 4.4°
  const jitterY = (h >> 4) % 22 - 6                        // desordena la línea base
  const width = Math.min(240, Math.max(130, 110 + idea.text.length * 2.2 + ((h >> 8) % 30)))
  const jitterX = ((h >> 12) % 13) - 6                      // ligera dispersión horizontal
  const [dragging, setDragging] = useState(false)

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragStart={() => setDragging(true)}
      onDragEnd={(_, info) => { onMoved(info.offset.x, info.offset.y); setTimeout(() => setDragging(false), 0) }}
      initial={{ opacity: 0, y: -60, rotate: rotate * 3 }}
      animate={{ opacity: 1, rotate, x: offset?.x || 0, y: offset?.y || 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 14, delay: Math.min(index * 0.035, 1.2) }}
      whileHover={{ scale: 1.04, zIndex: 20 }}
      whileDrag={{ scale: 1.08, zIndex: 30, cursor: 'grabbing' }}
      onClick={() => { if (!dragging) onOpen() }}
      className="relative cursor-grab select-none touch-none"
      style={{ width: `min(${width}px, 44vw)`, marginTop: Math.max(0, jitterY), marginLeft: jitterX, marginRight: -jitterX }}
    >
      <div
        className="p-3 border"
        style={{
          clipPath: cut(8),
          borderColor: `${kind.color}55`,
          background: `linear-gradient(160deg, ${kind.color}1f, #0b0b0b 75%)`,
          boxShadow: '0 6px 18px rgba(0,0,0,0.5)',
        }}
      >
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color: kind.color }}>{kind.label}</span>
          {idea.projectEmoji && <span className="text-xs" title={idea.projectName}>{idea.projectEmoji}</span>}
        </div>
        <p className="text-sm leading-snug text-gray-100" style={{ fontSize: idea.text.length < 40 ? 15 : 13 }}>{idea.text}</p>
        <p className="font-mono text-[8px] text-gray-600 mt-1.5">{fmtDate(idea.date)}</p>
      </div>
    </motion.div>
  )
}

// ─── Detalle + acciones ───────────────────────────────────────────────────
function IdeaDetail({ idea, projects, hiddenReason, onClose, onResolve, onRestore, onDelete, onToRoute }) {
  const kind = IDEA_KINDS[idea.kind]
  const activeProjects = projects.filter(p => p.status !== 'done')
  const [target, setTarget] = useState(idea.projectId && activeProjects.some(p => p.id === idea.projectId) ? idea.projectId : activeProjects[0]?.id)

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/70 z-[300]" />
      <div className="fixed inset-0 z-[310] flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          className="pointer-events-auto w-full max-w-md border p-5"
          style={{ background: '#0b0b0b', clipPath: cut(12), borderColor: `${kind.color}66`, fontFamily: "'Rajdhani', sans-serif" }}
        >
          <div className="flex items-start justify-between gap-3">
            <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: kind.color }}>// {kind.label}</span>
            <button onClick={onClose} className="text-gray-500 hover:text-white" aria-label="Cerrar"><X size={16} /></button>
          </div>
          <p className="text-xl font-semibold leading-snug mt-1">{idea.text}</p>
          <div className="mt-2 text-xs font-mono text-gray-500 space-y-0.5">
            <p>{fmtDate(idea.date)}{idea.projectName ? ` · ${idea.projectEmoji || ''} ${idea.projectName}` : ''}</p>
            {idea.origin && <p>Sesión: <span className="text-gray-400">{idea.origin}</span></p>}
          </div>

          {hiddenReason ? (
            <div className="mt-4 flex gap-2">
              <p className="flex-1 text-xs text-gray-500 self-center">{hiddenReason === 'convertida' ? 'Convertida en paso de una ruta.' : 'Marcada como resuelta.'}</p>
              <button onClick={onRestore} className="px-3 py-2 text-xs font-bold uppercase border border-orange-500/40 text-orange-400" style={{ clipPath: cut(5) }}>Devolver a la pizarra</button>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {activeProjects.length > 0 && (
                <div className="p-2.5 border border-orange-500/20" style={{ clipPath: cut(6) }}>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-orange-400/80 mb-1.5">Convertir en paso de la ruta</p>
                  <div className="flex gap-2">
                    <select value={target} onChange={e => setTarget(e.target.value)}
                      className="flex-1 min-w-0 bg-black border border-white/10 text-sm text-gray-200 p-2 focus:outline-none">
                      {activeProjects.map(p => <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}
                    </select>
                    <button onClick={() => onToRoute(target)} className="px-3 bg-orange-500 text-black text-xs font-bold uppercase flex items-center gap-1" style={{ clipPath: cut(4) }}>
                      <ListPlus size={14} /> Añadir
                    </button>
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={onResolve} className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider bg-green-500 text-black flex items-center justify-center gap-1.5" style={{ clipPath: cut(6) }}>
                  <Check size={14} /> Resuelta
                </button>
                {onDelete && (
                  <button onClick={onDelete} className="px-4 py-2.5 text-xs font-bold uppercase border border-red-500/40 text-red-400 flex items-center gap-1.5" style={{ clipPath: cut(6) }}>
                    <Trash2 size={13} /> Borrar
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </>
  )
}
