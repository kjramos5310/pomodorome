import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Trash2, FolderKanban, Zap, Pencil } from 'lucide-react'
import HudPanel from '../components/HudPanel'
import Coverflow from '../components/Coverflow'
import ProjectDetailTabs from '../components/ProjectDetailTabs'
import { routeProgress } from '../lib/projectStats'
import { useWorld } from '../lib/worldContext'
import WorldPicker from '../components/WorldPicker'
import { WORLD_LIST, DEFAULT_WORLD } from '../lib/worlds'
import GifGallery from '../components/GifGallery'

// Activity categories
const ACTIVITY_TEMPLATES = {
  principales: [
    {
      name: 'Tesis',
      emoji: '📝',
      category: 'principal',
      gif: 'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3bnpvbWU1Y2F5cW04dThsOWtlZDcyNW9zOTh2eXBnbjN5Z2Z4b2E3ZCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/LpiA8MVudQO8pitF4c/giphy.gif',
      focusExample: 'Ej: Redactar capítulo 2, revisar bibliografía, avanzar marco teórico…',
    },
    {
      name: 'Programación',
      emoji: '💻',
      category: 'principal',
      gif: 'https://media.giphy.com/media/U4ZItT6PM3leNZsBtt/giphy.gif',
      focusExample: 'Ej: Implementar feature X, resolver bug Y, aprender concepto Z…',
    },
    {
      name: 'Redes',
      emoji: '📡',
      category: 'principal',
      gif: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExc3VhODQxc2cxbW83OXVqbTBxYTJuaGwwbjhyMnlqc2RsazliaGxoNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/TjFUxbRz3cgfbHmQxs/giphy.gif',
      focusExample: 'Ej: Estudiar protocolo TCP/IP, practicar subneting, repasar OSI…',
    },
    {
      name: 'Inteligencia Artificial',
      emoji: '🧠',
      category: 'principal',
      gif: 'https://media.giphy.com/media/Tk0g95CHcEuLVveAj3/giphy.gif',
      focusExample: 'Ej: Implementar modelo X, estudiar paper Y, practicar con dataset Z…',
    },
  ],
  complementarias: [
    {
      name: 'Inglés',
      emoji: '🌎',
      category: 'complementaria',
      gif: 'https://media.giphy.com/media/TKDSgScrDV3yPKXMfI/giphy.gif',
      focusExample: 'Ej: 20 flashcards nuevas, escuchar podcast 30 min, vocabulario de redes…',
    },
    {
      name: 'Entrenamiento de fuerza',
      emoji: '🏋️',
      category: 'complementaria',
      gif: 'https://media.giphy.com/media/yYU6Mivn9bhV0x8BmX/giphy.gif',
      focusExample: 'Ej: Press banca 4×10, sentadilla progresiva, 10 series de X…',
    },
    {
      name: 'Improvisación',
      emoji: '🎭',
      category: 'complementaria',
      gif: 'https://media.giphy.com/media/UkkOy67JwSPAGOtuXS/giphy.gif',
      focusExample: 'Ej: 15 min de impro en inglés, narrar sin parar 10 min en español…',
    },
    {
      name: 'Lectura',
      emoji: '📚',
      category: 'complementaria',
      gif: 'https://media.giphy.com/media/YWOs5jNvBu9VVpw37A/giphy.gif',
      focusExample: 'Ej: 30 páginas de X, leer artículo técnico, capítulo del libro Y…',
    },
    {
      name: 'Shadowing YouTube',
      emoji: '🎙️',
      category: 'complementaria',
      gif: 'https://media.giphy.com/media/FSZoHhWyU5iESIz0lo/giphy.gif',
      focusExample: 'Ej: 1 video ×3 repeticiones, imitar pronunciación de X hablante…',
    },
  ],
  custom: [
    { name: 'Proyecto personalizado', emoji: '📁', category: 'custom', gif: '', focusExample: 'Describe de qué va tu proyecto…' },
  ]
}
// Flat list kept for legacy compatibility
const cut = (n) => `polygon(${n}px 0%, 100% 0%, 100% calc(100% - ${n}px), calc(100% - ${n}px) 100%, 0% 100%, 0% ${n}px)`

const PROJECT_TEMPLATES = [
  ...ACTIVITY_TEMPLATES.principales,
  ...ACTIVITY_TEMPLATES.complementarias,
  ...ACTIVITY_TEMPLATES.custom,
]
// PROJECTS SCREEN
export default function ProjectsScreen({ projects, currentProject, onSelectProject, onAddProject, onDeleteProject, onUpdateProject, history }) {
  const [showNewProject, setShowNewProject] = useState(false)
  const [filter, setFilter] = useState('in_progress')
  // Empezar centrado en el proyecto activo
  const [activeIndex, setActiveIndex] = useState(() => {
    const list = projects.filter(p => (p.status || 'in_progress') === (currentProject?.status || 'in_progress'))
    return Math.max(0, list.findIndex(p => p.id === currentProject?.id))
  })
  const [step, setStep] = useState('template') // 'template' | 'custom' (identidad) | 'duration'
  const [editingId, setEditingId] = useState(null) // editar identidad de un proyecto existente
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [customName, setCustomName] = useState('')
  const [customGif, setCustomGif] = useState('')
  const [customEmoji, setCustomEmoji] = useState('📁')
  const [plannedDays, setPlannedDays] = useState(7)
  const [hoursGoal, setHoursGoal] = useState(10)
  const [projectFocus, setProjectFocus] = useState('')
  const [newWorld, setNewWorld] = useState(DEFAULT_WORLD)

  const emojis = ['📚', '💻', '🎨', '🏋️', '🎵', '📝', '🔬', '📊', '🎯', '💡', '⚔️', '🛡️', '🚀', '🌟', '⚡', '🌅', '🌌', '🧭']

  const theme = useWorld()
  const STATUS_CONFIG = {
    in_progress: { label: 'En curso', tab: 'En curso', hex: theme.accent },
    paused: { label: 'Pausado', tab: 'Pausados', hex: '#eab308' },
    done: { label: 'Terminado', tab: 'Archivados', hex: '#22c55e' },
  }
  const statusOf = (p) => p.status || 'in_progress'
  const visible = projects.filter(p => statusOf(p) === filter)
  const active = Math.min(activeIndex, Math.max(0, visible.length - 1))
  const current = visible[active]
  const changeFilter = (f) => { setFilter(f); setActiveIndex(0) }

  const openNew = () => {
    setEditingId(null)
    setStep('template')
    setSelectedTemplate(null)
    setCustomName('')
    setCustomGif('')
    setCustomEmoji('📁')
    setPlannedDays(7)
    setHoursGoal(10)
    setProjectFocus('')
    setNewWorld(DEFAULT_WORLD)
    setShowNewProject(true)
  }

  // La plantilla solo es un punto de partida: precarga nombre, icono y GIF, todo editable
  const handleSelectTemplate = (tpl) => {
    const isBlank = tpl.name === 'Proyecto personalizado'
    setSelectedTemplate(tpl)
    setCustomName('')
    setCustomEmoji(tpl.emoji || '📁')
    setCustomGif(tpl.gif || '')
    setStep('custom')
  }

  const openEdit = (project) => {
    setEditingId(project.id)
    setSelectedTemplate(null)
    setCustomName(project.name)
    setCustomEmoji(project.emoji || '📁')
    setCustomGif(project.gif || '')
    setProjectFocus(project.focus || '')
    setStep('custom')
    setShowNewProject(true)
  }

  // Lo que escribes manda; si lo dejas vacío se usa el nombre sugerido por la plantilla
  const suggestedName = selectedTemplate && selectedTemplate.name !== 'Proyecto personalizado' ? selectedTemplate.name : ''
  const finalName = customName.trim() || suggestedName

  const saveEdit = () => {
    const p = projects.find(x => x.id === editingId)
    const name = customName.trim()
    if (!p || !name) return
    // Si el arco seguía siendo el nombre viejo, lo renombramos también
    const arc = !p.arc || p.arc === p.name ? name : p.arc
    onUpdateProject({ ...p, name, emoji: customEmoji, gif: customGif, focus: projectFocus.trim(), arc })
    setShowNewProject(false)
    setEditingId(null)
  }

  const handleCreate = () => {
    const name = finalName
    if (!name) return
    const newProject = {
      id: Date.now().toString(),
      name,
      emoji: customEmoji,
      gif: customGif.trim(),
      createdAt: new Date().toISOString(),
      totalDeepworks: 0,
      status: 'in_progress',
      plannedDays,
      hoursGoal,
      hoursLogged: 0,
      focus: projectFocus.trim(),
      world: newWorld,
      arc: name,
    }
    onAddProject(newProject)
    setShowNewProject(false)
    setFilter('in_progress')
    setActiveIndex(projects.filter(p => statusOf(p) === 'in_progress').length)
  }

  const getProjectStats = (projectId) => {
    const entries = (history || []).filter(e => e.projectId === projectId)
    const minutes = Math.round(entries.reduce((s, e) => s + (e.duration || 0), 0) / 60)
    return {
      sessions: entries.length,
      deepworks: entries.reduce((s, e) => s + e.deepworksCompleted, 0),
      hours: +(minutes / 60).toFixed(1),
      entries
    }
  }

  const motivationalMsg = (pct) => {
    if (pct >= 100) return '🏆 ¡Meta alcanzada! Increíble.'
    if (pct >= 80) return '🔥 ¡Casi! Estás muy cerca del objetivo'
    if (pct >= 50) return '💪 Buen avance — más de la mitad hecho'
    if (pct >= 20) return '🌱 Cada sesión suma. Vas construyendo'
    return '✨ El primer paso es comenzar'
  }

  const daysLeftOf = (project) => project.plannedDays
    ? Math.max(0, project.plannedDays - Math.floor((Date.now() - new Date(project.createdAt)) / 86400000))
    : null

  const setStatus = (project, status) => {
    onUpdateProject({ ...project, status })
    // Seguir mostrando el proyecto: cambiar al filtro de su nuevo estado
    const list = projects.map(p => p.id === project.id ? { ...p, status } : p).filter(p => statusOf(p) === status)
    setFilter(status)
    setActiveIndex(Math.max(0, list.findIndex(p => p.id === project.id)))
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-full pt-24 pb-10 relative text-white overflow-x-hidden"
      style={{ background: 'var(--bg)', fontFamily: "'Rajdhani', sans-serif" }}
    >
      <div className="hud-scanline" />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 60% 40% at 50% 35%, rgba(var(--accent-rgb),0.07) 0%, transparent 70%)'
      }} />

      {/* ── Título ── */}
      <div className="relative z-10 px-4 sm:px-6 max-w-xl mx-auto flex items-end justify-between mb-4">
        <div>
          <p className="hud-label" style={{ color: 'rgba(var(--accent-rgb),0.5)' }}>// SYSTEM_DATABASE_INDEX</p>
          <h1 className="hud-title text-3xl mt-1 flex items-center gap-2">
            <FolderKanban size={26} className="text-orange-500" /> Proyectos
          </h1>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider text-black hover:brightness-110 transition"
          style={{ clipPath: cut(6), background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
        >
          <Plus size={14} /> Nuevo
        </button>
      </div>

      {/* ── Filtros por estado ── */}
      <div className="relative z-10 px-4 sm:px-6 max-w-xl mx-auto flex gap-2 mb-2 overflow-x-auto pb-1">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const count = projects.filter(p => statusOf(p) === key).length
          const on = filter === key
          return (
            <button
              key={key}
              onClick={() => changeFilter(key)}
              className="flex-shrink-0 px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider border transition-colors"
              style={{
                clipPath: cut(4),
                borderColor: on ? cfg.hex : 'rgba(var(--accent-rgb),0.15)',
                color: on ? '#080808' : '#9ca3af',
                background: on ? cfg.hex : 'rgba(var(--accent-rgb),0.02)',
              }}
            >
              {cfg.tab} · {count}
            </button>
          )
        })}
      </div>

      {/* ── Carrusel ── */}
      {visible.length === 0 ? (
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6" style={{ height: 300 }}>
          <p className="hud-label mb-2">// SIN_REGISTROS</p>
          <p className="text-gray-400 text-sm mb-4">
            {filter === 'done' ? 'Aún no hay proyectos terminados.' : filter === 'paused' ? 'No tienes proyectos en pausa.' : 'No hay proyectos en curso.'}
          </p>
          {filter === 'in_progress' && (
            <button onClick={openNew} className="text-orange-400 text-sm underline underline-offset-4">Crear un proyecto</button>
          )}
        </div>
      ) : (
        <Coverflow
          items={visible}
          activeIndex={active}
          onChange={setActiveIndex}
          disableKeys={showNewProject}
          ratio={1.4}
          getColor={(p) => STATUS_CONFIG[statusOf(p)].hex}
          getLabel={(p) => p.name}
          renderCard={(project, isCenter) => (
            <ProjectCover
              project={project}
              isCenter={isCenter}
              isActive={currentProject?.id === project.id}
              color={STATUS_CONFIG[statusOf(project)].hex}
              stats={getProjectStats(project.id)}
            />
          )}
        />
      )}

      {/* ── Ficha del proyecto del centro ── */}
      <div className="relative z-10 px-4 sm:px-6 max-w-xl mx-auto">
        <AnimatePresence mode="wait">
          {current && (() => {
            const stats = getProjectStats(current.id)
            const isActive = currentProject?.id === current.id
            const status = statusOf(current)
            const cfg = STATUS_CONFIG[status]
            const hoursGoalVal = current.hoursGoal || 1
            const pct = Math.min(Math.round((stats.hours / hoursGoalVal) * 100), 100)
            const daysLeft = daysLeftOf(current)

            return (
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <HudPanel title="PROYECTO_SELECCIONADO" mod="PRJ-DB" id={current.id.slice(-6).toUpperCase()} dotStatus={isActive ? 'active' : 'standby'} stripeColor={cfg.hex}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-2xl font-bold leading-tight break-words">{current.emoji} {current.name}</h2>
                      <p className="text-xs font-mono mt-0.5 uppercase tracking-wider" style={{ color: isActive ? 'var(--accent)' : '#6b7280' }}>
                        {isActive ? '[ // SYSTEM_ACTIVE ]' : `// ${cfg.label}`}
                        {daysLeft !== null && status !== 'done' && <span className="text-gray-500"> · {daysLeft > 0 ? `${daysLeft} días restantes` : 'plazo cumplido'}</span>}
                      </p>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => openEdit(current)}
                      className="p-2 text-gray-400 hover:text-orange-400 border border-orange-500/15"
                      style={{ clipPath: cut(4) }}
                      aria-label="Editar nombre, icono y GIF"
                    >
                      <Pencil size={14} />
                    </button>
                    {projects.length > 1 && (
                      <button
                        onClick={() => { if (confirm(`¿Eliminar "${current.name}"?`)) onDeleteProject(current.id) }}
                        className="p-2 text-gray-400 hover:text-red-400 border border-orange-500/15 flex-shrink-0"
                        style={{ clipPath: cut(4) }}
                        aria-label="Eliminar proyecto"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                    </div>
                  </div>

                  {current.focus && (
                    <div className="mt-3 p-3 border border-orange-500/10 bg-neutral-950" style={{ clipPath: cut(6) }}>
                      <p className="font-mono text-[8px] text-orange-400/60 uppercase tracking-widest mb-1">// DESCRIPCIÓN_ENFOQUE</p>
                      <p className="text-sm text-gray-300 leading-relaxed">{current.focus}</p>
                    </div>
                  )}

                  {/* Estado */}
                  <div className="flex gap-2 mt-3">
                    {Object.entries(STATUS_CONFIG).map(([key, c]) => (
                      <button
                        key={key}
                        onClick={() => setStatus(current, key)}
                        className="flex-1 py-1.5 text-[10px] font-mono uppercase tracking-wider border transition-colors"
                        style={{
                          clipPath: cut(4),
                          borderColor: status === key ? c.hex : 'rgba(255,255,255,0.08)',
                          color: status === key ? c.hex : '#6b7280',
                          background: status === key ? `${c.hex}14` : 'transparent',
                        }}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>

                  {/* Progreso en horas */}
                  <div className="mt-4">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="hud-label">// PROGRESO_EN_HORAS</span>
                      <span className="font-mono text-xs text-gray-400">
                        <span className="hud-value text-base" style={{ color: cfg.hex }}>{pct}%</span> · {stats.hours}h / {hoursGoalVal}h
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-neutral-950 border border-orange-500/10 overflow-hidden" style={{ clipPath: cut(2) }}>
                      <motion.div className="h-full bg-gradient-to-r from-orange-500 to-[var(--accent-2)]" initial={false} animate={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1.5 font-mono">// {motivationalMsg(pct).toUpperCase()}</p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {[
                      { label: 'Sesiones', value: stats.sessions },
                      { label: 'Horas', value: `${stats.hours}h` },
                      { label: 'Plazo', value: current.plannedDays ? `${current.plannedDays}d` : '—' },
                    ].map(({ label, value }) => (
                      <div key={label} className="border border-orange-500/10 bg-neutral-950 p-2.5 text-center" style={{ clipPath: cut(6) }}>
                        <p className="hud-value text-orange-400 text-base">{value}</p>
                        <p className="text-[9px] font-mono text-gray-500 uppercase mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Mundo del proyecto */}
                  <WorldPicker project={current} hours={stats.hours} onUpdate={onUpdateProject} />

                  {/* Ruta · Ritmo · Bitácora */}
                  <ProjectDetailTabs
                    project={current}
                    entries={stats.entries}
                    onUpdate={onUpdateProject}
                    onFinishProject={() => setStatus(current, 'done')}
                    history={history}
                    projects={projects}
                  />

                  {/* Activar */}
                  {!isActive && status !== 'done' && (
                    <button
                      onClick={() => onSelectProject(current)}
                      className="w-full mt-4 py-3 bg-gradient-to-r from-orange-500 to-[var(--accent-2)] text-black font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2"
                      style={{ clipPath: cut(8) }}
                    >
                      <Zap size={14} /> Activar proyecto
                    </button>
                  )}
                </HudPanel>
              </motion.div>
            )
          })()}
        </AnimatePresence>
      </div>

      {/* ── NEW PROJECT WIZARD MODAL ── */}
      <AnimatePresence>
        {showNewProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 z-50 flex items-end justify-center px-4"
            onClick={() => setShowNewProject(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto border-t border-l border-r border-orange-500/25 relative"
              style={{
                background: 'var(--bg)',
                clipPath: 'polygon(16px 0%, calc(100% - 16px) 0%, 100% 16px, 100% 100%, 0% 100%, 0% 16px)'
              }}
            >
              {/* Modal Scanline Overlay */}
              <div className="hud-scanline" />

              <div className="p-5 relative z-10">
                <div className="flex items-center justify-between mb-5 border-b border-orange-500/10 pb-3">
                  <div>
                    <h3 className="text-base font-bold uppercase tracking-wider text-white">
                      {step === 'template' ? 'Punto de Partida'
                        : step === 'duration' ? 'Objetivos Temporales'
                          : editingId ? 'Editar Identidad' : 'Identidad del Proyecto'}
                    </h3>
                    <span className="font-mono text-[7px] text-gray-500 tracking-widest leading-none">
                      WIZARD_STAGE: {step.toUpperCase()}
                    </span>
                  </div>
                  <button onClick={() => setShowNewProject(false)}
                    className="w-7 h-7 bg-black/75 border border-orange-500/30 text-orange-400 hover:text-white flex items-center justify-center cursor-pointer"
                    style={{ clipPath: 'polygon(4px 0%, 100% 0%, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0% 100%, 0% 4px)' }}>
                    <X size={14} />
                  </button>
                </div>

                {/* STEP 1: template list — activity categories */}
                {step === 'template' && (
                  <div className="space-y-4">

                    {/* Principales */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-2 font-mono">
                        <span className="w-1.5 h-1.5 bg-red-500" />
                        <p className="text-[9px] font-extrabold text-red-500 uppercase tracking-widest">Misiones Principales (Core)</p>
                      </div>
                      <div className="space-y-1.5">
                        {ACTIVITY_TEMPLATES.principales.map((tpl, i) => (
                          <button
                            key={i}
                            onClick={() => handleSelectTemplate(tpl)}
                            className="w-full flex items-center gap-3 p-3 bg-neutral-950 border border-orange-500/10 hover:border-orange-500/40 transition-all text-left cursor-pointer"
                            style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}
                          >
                            {tpl.gif ? (
                              <div className="w-10 h-10 overflow-hidden flex-shrink-0 border border-orange-500/10">
                                <img src={tpl.gif} alt={tpl.name} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 bg-[#0d0d0d] border border-orange-500/10 flex items-center justify-center text-xl flex-shrink-0">{tpl.emoji}</div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm text-gray-200 uppercase tracking-wide">{tpl.name}</p>
                              <p className="text-[9px] text-gray-500 font-mono truncate">{tpl.focusExample.toUpperCase()}</p>
                            </div>
                            <span className="font-mono text-[8px] font-bold px-1.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 flex-shrink-0">CORE</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Complementarias */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-2 font-mono">
                        <span className="w-1.5 h-1.5 bg-yellow-500" />
                        <p className="text-[9px] font-extrabold text-yellow-500 uppercase tracking-widest">Actividades Secundarias (Plus)</p>
                      </div>
                      <div className="space-y-1.5">
                        {ACTIVITY_TEMPLATES.complementarias.map((tpl, i) => (
                          <button
                            key={i}
                            onClick={() => handleSelectTemplate(tpl)}
                            className="w-full flex items-center gap-3 p-3 bg-neutral-950 border border-orange-500/10 hover:border-orange-500/40 transition-all text-left cursor-pointer"
                            style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}
                          >
                            {tpl.gif ? (
                              <div className="w-10 h-10 overflow-hidden flex-shrink-0 border border-orange-500/10">
                                <img src={tpl.gif} alt={tpl.name} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 bg-[#0d0d0d] border border-orange-500/10 flex items-center justify-center text-xl flex-shrink-0">{tpl.emoji}</div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm text-gray-200 uppercase tracking-wide">{tpl.name}</p>
                              <p className="text-[9px] text-gray-500 font-mono truncate">{tpl.focusExample.toUpperCase()}</p>
                            </div>
                            <span className="font-mono text-[8px] font-bold px-1.5 py-0.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 flex-shrink-0">PLUS</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom */}
                    <div>
                      <div className="space-y-1.5 font-mono">
                        {ACTIVITY_TEMPLATES.custom.map((tpl, i) => (
                          <button
                            key={i}
                            onClick={() => handleSelectTemplate(tpl)}
                            className="w-full flex items-center gap-3 p-3 bg-neutral-950 border border-dashed border-orange-500/20 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all text-left cursor-pointer"
                            style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}
                          >
                            <div className="w-10 h-10 bg-[#0d0d0d] border border-orange-500/5 flex items-center justify-center text-xl flex-shrink-0">{tpl.emoji}</div>
                            <div className="flex-1">
                              <p className="text-xs text-gray-400 uppercase tracking-widest">{tpl.name.toUpperCase()}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* STEP 3: duration & hours goal */}
                {step === 'duration' && (
                  <div>
                    <div className="mb-5">
                      <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-1">// PLAZO DE EJECUCIÓN (DÍAS)</p>
                      <p className="text-[9px] text-gray-500 font-mono mb-2">SELECCIONA EL TIEMPO ESTIMADO PARA LA META</p>
                      <div className="flex gap-1.5 mb-2.5 flex-wrap">
                        {[1, 3, 7, 14, 30].map(d => (
                          <button
                            key={d}
                            onClick={() => setPlannedDays(d)}
                            className="px-3 py-1.5 text-xs font-bold uppercase transition-all border cursor-pointer"
                            style={{
                              background: plannedDays === d ? 'rgba(var(--accent-rgb),0.1)' : 'rgba(0,0,0,0.5)',
                              border: plannedDays === d ? '1px solid var(--accent)' : '1px solid rgba(var(--accent-rgb),0.15)',
                              color: plannedDays === d ? 'var(--accent)' : '#6b7280',
                              clipPath: 'polygon(4px 0%, 100% 0%, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0% 100%, 0% 4px)'
                            }}
                          >
                            {d === 1 ? '1 DÍA' : d === 7 ? '1 SEMANA' : d === 14 ? '2 SEMANAS' : d === 30 ? '1 MES' : `${d} DÍAS`}
                          </button>
                        ))}
                      </div>
                      <input
                        type="number"
                        value={plannedDays}
                        onChange={e => setPlannedDays(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full p-2.5 bg-neutral-950 border border-orange-500/20 text-white focus:outline-none focus:border-orange-500 text-xs font-mono"
                        style={{ clipPath: 'polygon(4px 0%, 100% 0%, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0% 100%, 0% 4px)' }}
                        placeholder="DIAS PERSONALIZADOS"
                        min={1}
                      />
                    </div>

                    <div className="mb-5">
                      <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-1">// CUOTA DE TRABAJO (HORAS METAS)</p>
                      <p className="text-[9px] text-gray-500 font-mono mb-2">HORAS TOTALES DE ENFOQUE A LOGRAR</p>
                      <div className="flex gap-1.5 mb-2.5 flex-wrap">
                        {[5, 10, 20, 40, 80].map(h => (
                          <button
                            key={h}
                            onClick={() => setHoursGoal(h)}
                            className="px-3 py-1.5 text-xs font-bold uppercase transition-all border cursor-pointer"
                            style={{
                              background: hoursGoal === h ? 'rgba(var(--accent-rgb),0.1)' : 'rgba(0,0,0,0.5)',
                              border: hoursGoal === h ? '1px solid var(--accent)' : '1px solid rgba(var(--accent-rgb),0.15)',
                              color: hoursGoal === h ? 'var(--accent)' : '#6b7280',
                              clipPath: 'polygon(4px 0%, 100% 0%, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0% 100%, 0% 4px)'
                            }}
                          >
                            {h}H
                          </button>
                        ))}
                      </div>
                      <input
                        type="number"
                        value={hoursGoal}
                        onChange={e => setHoursGoal(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full p-2.5 bg-neutral-950 border border-orange-500/20 text-white focus:outline-none focus:border-orange-500 text-xs font-mono"
                        style={{ clipPath: 'polygon(4px 0%, 100% 0%, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0% 100%, 0% 4px)' }}
                        placeholder="HORAS PERSONALIZADAS"
                        min={1}
                      />
                    </div>

                    <div className="mb-5">
                      <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-1">// MUNDO</p>
                      <p className="text-[9px] text-gray-500 font-mono mb-2">LA ESTÉTICA DE LA APP CUANDO ESTE PROYECTO ESTÉ ACTIVO</p>
                      <div className="grid grid-cols-3 gap-1.5">
                        {WORLD_LIST.map(w => {
                          const on = newWorld === w.id
                          const c = w.levels[0].accent
                          return (
                            <button key={w.id} onClick={() => setNewWorld(w.id)}
                              className="p-2 border text-left cursor-pointer"
                              style={{ clipPath: 'polygon(4px 0%, 100% 0%, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0% 100%, 0% 4px)', borderColor: on ? c : 'rgba(255,255,255,0.08)', background: on ? `${c}1f` : w.bg }}>
                              <span className="block h-1 mb-1" style={{ background: c }} />
                              <span className="text-xs font-bold" style={{ color: on ? c : '#9ca3af' }}>{w.emoji} {w.name}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button onClick={() => setStep('custom')}
                        className="flex-1 py-3 bg-neutral-950 border border-orange-500/20 text-gray-400 hover:text-white text-xs uppercase font-extrabold cursor-pointer"
                        style={{ clipPath: 'polygon(6px 0%, 100% 0%, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0% 100%, 0% 6px)' }}>
                        Atrás
                      </button>
                      <button onClick={handleCreate}
                        className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-[var(--accent-2)] text-black text-xs uppercase font-extrabold cursor-pointer"
                        style={{ clipPath: 'polygon(6px 0%, 100% 0%, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0% 100%, 0% 6px)' }}>
                        CREAR PROYECTO
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP: identidad — nombre, icono y GIF libres (la plantilla solo precarga) */}
                {step === 'custom' && (
                  <div>
                    {customGif && (
                      <div className="relative h-32 overflow-hidden mb-3 border border-orange-500/10"
                        style={{ clipPath: 'polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)' }}>
                        <img src={customGif} alt="" className="w-full h-full object-cover opacity-85" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />
                        <p className="absolute bottom-2 left-3 right-3 text-sm font-bold uppercase tracking-wider text-white truncate">
                          {customEmoji} {finalName || 'Sin nombre'}
                        </p>
                      </div>
                    )}

                    <p className="text-[10px] font-mono text-orange-400 uppercase tracking-widest mb-1.5">// NOMBRE DEL PROYECTO</p>
                    <input
                      type="text"
                      value={customName}
                      onChange={e => setCustomName(e.target.value)}
                      placeholder={suggestedName || 'Ej: Trono de Yggdrasil, Tesis capítulo 3…'}
                      aria-label="Nombre del proyecto"
                      className="w-full p-3 bg-neutral-950 border border-orange-500/20 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 mb-1 text-sm"
                      style={{ clipPath: 'polygon(6px 0%, 100% 0%, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0% 100%, 0% 6px)' }}
                      autoFocus
                    />
                    <p className="text-[9px] font-mono text-gray-600 mb-4">
                      {suggestedName
                        ? `// ESCRIBE TU NOMBRE — SI LO DEJAS VACÍO SE LLAMARÁ "${suggestedName.toUpperCase()}"`
                        : '// PONLE EL NOMBRE QUE QUIERAS'}
                    </p>

                    <p className="text-[10px] font-mono text-orange-400 uppercase tracking-widest mb-1.5">// ICONO</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {[...new Set([customEmoji, ...emojis])].map(e => (
                        <button key={e} onClick={() => setCustomEmoji(e)}
                          className="text-xl p-1.5 transition-all cursor-pointer"
                          style={{
                            background: customEmoji === e ? 'rgba(var(--accent-rgb),0.1)' : 'rgba(0,0,0,0.5)',
                            border: customEmoji === e ? '1px solid var(--accent)' : '1px solid rgba(var(--accent-rgb),0.15)',
                            clipPath: 'polygon(4px 0%, 100% 0%, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0% 100%, 0% 4px)'
                          }}>
                          {e}
                        </button>
                      ))}
                    </div>

                    <p className="text-[10px] font-mono text-orange-400 uppercase tracking-widest mb-1.5">// GIF — ELIGE CUALQUIERA</p>
                    <div className="mb-4">
                      <GifGallery value={customGif} onChange={setCustomGif} projectGifs={projects.map(p => p.gif)} />
                    </div>

                    <p className="text-[10px] font-mono text-orange-400 uppercase tracking-widest mb-1.5">// ENFOQUE (OPCIONAL)</p>
                    <textarea
                      value={projectFocus}
                      onChange={e => setProjectFocus(e.target.value)}
                      placeholder={selectedTemplate?.focusExample ? `Ej: ${selectedTemplate.focusExample}` : '¿En qué subtarea o área te enfocarás?'}
                      rows={2}
                      className="w-full p-3 bg-neutral-950 border border-orange-500/20 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 text-sm resize-none mb-4 font-sans"
                      style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}
                    />

                    <div className="flex gap-3">
                      <button onClick={() => editingId ? setShowNewProject(false) : setStep('template')}
                        className="flex-1 py-3 bg-neutral-950 border border-orange-500/20 text-gray-400 hover:text-white text-xs uppercase font-extrabold cursor-pointer"
                        style={{ clipPath: 'polygon(6px 0%, 100% 0%, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0% 100%, 0% 6px)' }}>
                        {editingId ? 'Cancelar' : 'Atrás'}
                      </button>
                      <button onClick={() => editingId ? saveEdit() : setStep('duration')} disabled={!finalName}
                        className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-[var(--accent-2)] text-black text-xs uppercase font-extrabold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ clipPath: 'polygon(6px 0%, 100% 0%, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0% 100%, 0% 6px)' }}>
                        {editingId ? 'Guardar' : 'Continuar'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Portada de proyecto para el carrusel ─────────────────────────────────
function ProjectCover({ project, isCenter, isActive, color, stats }) {
  const [imgFailed, setImgFailed] = useState(false)
  const pct = Math.min(Math.round((stats.hours / (project.hoursGoal || 1)) * 100), 100)
  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col" style={{ clipPath: cut(10), background: '#0b0b0b', border: `1px solid ${color}55` }}>
      <div className="relative flex-[1.2] overflow-hidden border-b" style={{ borderColor: `${color}22` }}>
        {project.gif && !imgFailed ? (
          <img src={project.gif} alt={project.name} draggable={false} onError={() => setImgFailed(true)} className="w-full h-full object-cover opacity-80" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl relative" style={{ background: `linear-gradient(160deg, ${color}26, #0b0b0b 70%)` }}>
            <div className="absolute inset-0 opacity-[0.06]" style={{
              backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
              backgroundSize: '15px 15px'
            }} />
            <span className="relative">{project.emoji}</span>
          </div>
        )}
        {isActive && (
          <span className="absolute top-2 left-2 bg-orange-500 text-black text-[9px] font-extrabold px-2 py-0.5 tracking-widest uppercase" style={{ clipPath: cut(4) }}>
            Activo
          </span>
        )}
      </div>
      <div className="flex-1 p-3 flex flex-col justify-between text-left">
        <p className="font-bold uppercase leading-tight text-white line-clamp-2" style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, letterSpacing: '0.04em' }}>
          {project.name}
        </p>
        {routeProgress(project).total > 0 && (
          <p className="font-mono text-[9px] text-gray-400 -mt-1">▸ {routeProgress(project).done}/{routeProgress(project).total} pasos</p>
        )}
        <div>
          <div className="flex justify-between text-[10px] font-mono mb-1">
            <span style={{ color }}>{pct}%</span>
            <span className="text-gray-500">{stats.hours}h / {project.hoursGoal || 1}h</span>
          </div>
          <div className="w-full h-1.5 bg-neutral-950" style={{ border: `1px solid ${color}22` }}>
            <div className="h-full" style={{ width: `${pct}%`, background: color, boxShadow: isCenter ? `0 0 8px ${color}` : 'none' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
