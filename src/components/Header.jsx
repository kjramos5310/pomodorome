import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, ChevronDown, FolderKanban } from 'lucide-react'

const cut = (n) => `polygon(${n}px 0%, 100% 0%, 100% calc(100% - ${n}px), calc(100% - ${n}px) 100%, 0% 100%, 0% ${n}px)`

const STATUS_TAG = {
  in_progress: { label: 'EN CURSO', color: 'var(--accent)' },
  paused: { label: 'PAUSADO', color: '#eab308' },
}

// ============= HEADER COMPONENT =============
export default function Header({ currentProject, projects, showProjectSelector, setShowProjectSelector, setCurrentProject, onMenuClick, onManageProjects, worldLabel }) {
  const selectable = projects.filter(p => p.status !== 'done')
  const close = () => setShowProjectSelector(false)

  // Cerrar con Escape
  useEffect(() => {
    if (!showProjectSelector) return
    const onKey = (e) => { if (e.key === 'Escape') setShowProjectSelector(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showProjectSelector, setShowProjectSelector])

  return (
    <div
      className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md border-b border-orange-500/15"
      style={{ background: 'rgba(8,8,8,0.85)', fontFamily: "'Rajdhani', sans-serif" }}
    >
      <div className="flex items-center justify-between gap-3 px-4 h-16">
        {/* Menú */}
        <button
          onClick={onMenuClick}
          className="p-2 text-orange-400 border border-orange-500/20 hover:border-orange-500/60 transition-colors flex-shrink-0"
          style={{ clipPath: cut(5), background: 'rgba(var(--accent-rgb),0.03)' }}
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>

        {/* Selector de proyecto */}
        <div className="relative min-w-0 flex-1 flex justify-center">
          <button
            onClick={() => setShowProjectSelector(!showProjectSelector)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 border transition-colors max-w-full min-w-0"
            style={{
              clipPath: cut(7),
              borderColor: showProjectSelector ? 'var(--accent)' : 'rgba(var(--accent-rgb),0.25)',
              background: showProjectSelector ? 'rgba(var(--accent-rgb),0.08)' : 'rgba(var(--accent-rgb),0.03)',
            }}
            aria-expanded={showProjectSelector}
            aria-label="Cambiar de proyecto"
          >
            <span className="w-8 h-8 flex items-center justify-center text-lg bg-black/60 border border-orange-500/15 flex-shrink-0" style={{ clipPath: cut(4) }}>
              {currentProject.emoji}
            </span>
            <span className="flex flex-col items-start min-w-0 flex-1 overflow-hidden">
              <span className="hud-label text-[8px] leading-none truncate max-w-full" style={{ color: 'rgba(var(--accent-rgb),0.55)' }}>// {worldLabel || 'UNIDAD ACTIVA'}</span>
              <span className="block w-full font-bold text-sm text-white uppercase tracking-wide truncate sm:max-w-xs leading-tight mt-0.5 text-left">
                {currentProject.name}
              </span>
            </span>
            <ChevronDown size={16} className={`text-orange-400 flex-shrink-0 transition-transform ${showProjectSelector ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showProjectSelector && (
              <>
                {/* Fondo: tocar fuera cierra */}
                <motion.div
                  key="backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={close}
                  className="fixed left-0 right-0 bottom-0 top-16 bg-black/50"
                />
                <div key="menu" className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-10 w-[min(92vw,360px)]">
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="relative border border-orange-500/30 overflow-hidden"
                    style={{ background: '#0a0a0a', clipPath: cut(12), boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }}
                  >
                    <div className="hud-stripe" />
                    <div className="flex items-center justify-between px-4 pt-3 pb-2">
                      <span className="hud-label" style={{ color: 'rgba(var(--accent-rgb),0.6)' }}>// SELECCIONAR_UNIDAD</span>
                      <span className="hud-id">{String(selectable.length).padStart(2, '0')} DISPONIBLES</span>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto px-2 pb-2 space-y-1">
                      {selectable.map((project, i) => {
                        const active = currentProject.id === project.id
                        const tag = STATUS_TAG[project.status || 'in_progress'] || STATUS_TAG.in_progress
                        return (
                          <button
                            key={project.id}
                            onClick={() => { setCurrentProject(project); close() }}
                            className="w-full flex items-center gap-3 px-2.5 py-2.5 text-left border transition-colors group hover:bg-white/[0.03]"
                            style={{
                              clipPath: cut(6),
                              borderColor: active ? 'rgba(var(--accent-rgb),0.6)' : 'transparent',
                              background: active ? 'rgba(var(--accent-rgb),0.08)' : undefined,
                            }}
                          >
                            <span className="font-mono text-[10px] w-5 text-right flex-shrink-0" style={{ color: active ? 'var(--accent)' : '#4b5563' }}>
                              {String(i + 1).padStart(2, '0')}
                            </span>
                            <span className="w-9 h-9 flex items-center justify-center text-xl bg-black/60 border flex-shrink-0 group-hover:border-orange-500/40 transition-colors"
                              style={{ clipPath: cut(4), borderColor: active ? 'rgba(var(--accent-rgb),0.5)' : 'rgba(255,255,255,0.06)' }}>
                              {project.emoji}
                            </span>
                            <span className="flex-1 min-w-0">
                              <span className={`block text-sm font-semibold truncate ${active ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                {project.name}
                              </span>
                              <span className="block font-mono text-[9px] tracking-widest mt-0.5" style={{ color: active ? 'var(--accent)' : tag.color, opacity: active ? 1 : 0.7 }}>
                                {active ? '◉ ACTIVO' : tag.label}
                              </span>
                            </span>
                            {active && <span className="w-1 h-8 flex-shrink-0" style={{ background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }} />}
                          </button>
                        )
                      })}
                    </div>

                    {onManageProjects && (
                      <button
                        onClick={() => { close(); onManageProjects() }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 border-t border-orange-500/15 font-mono text-[10px] uppercase tracking-widest text-gray-500 hover:text-orange-400 hover:bg-orange-500/5 transition-colors"
                      >
                        <FolderKanban size={12} /> Gestionar proyectos →
                      </button>
                    )}
                  </motion.div>
                </div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="w-10 flex-shrink-0" />
      </div>
    </div>
  )
}
