import { motion, AnimatePresence } from 'framer-motion'
import { PlayCircle, X, Folder, History, BarChart3, CalendarDays, Compass, BookOpen, Zap, Lightbulb } from 'lucide-react'

// ============= SIDEBAR COMPONENT =============
export default function Sidebar({ show, onClose, onNavigate, currentScreen }) {
  const menuItems = [
    { id: 'home', icon: PlayCircle, label: 'Iniciar Deepwork', special: true },
    { id: 'ignition', icon: Zap, label: 'Chispa → Motor' },
    { id: 'roulette', icon: Compass, label: 'Ruleta Enciclopédica' },
    { id: 'books', icon: BookOpen, label: 'Libros' },
    { id: 'notes', icon: Lightbulb, label: 'Notas' },
    { id: 'projects', icon: Folder, label: 'Proyectos' },
    { id: 'history', icon: History, label: 'Historial' },
    { id: 'metrics', icon: BarChart3, label: 'Métricas' },
    { id: 'calendar', icon: CalendarDays, label: 'Calendario' }
  ]

  const handleNavigate = (id) => {
    if (id === 'home') {
      onNavigate(null)
    } else {
      onNavigate(id)
    }
    onClose()
  }

  const isCurrentActive = (item) => {
    if (item.id === 'home') return currentScreen === null
    return currentScreen === item.id
  }

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-72 z-50 border-r border-orange-500/15"
            style={{ background: 'var(--bg)', fontFamily: "'Rajdhani', sans-serif" }}
          >
            {/* Scanline overlay */}
            <div className="hud-scanline" />

            {/* Header */}
            <div className="p-6 border-b border-orange-500/10 flex items-center justify-between relative"
              style={{ background: 'rgba(var(--accent-rgb),0.02)' }}>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="hud-dot active" style={{ width: 6, height: 6 }} />
                  <h2 className="hud-title text-white text-lg leading-none tracking-wider font-bold">DEEPWORK</h2>
                </div>
                <span className="hud-label text-[8px] mt-1.5" style={{ color: 'rgba(var(--accent-rgb),0.4)', letterSpacing: '0.15em' }}>
                  // SYSTEM_NAVIGATION_CORE
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-orange-400 hover:text-orange-500 transition-colors border border-orange-500/20 hover:border-orange-500/50"
                style={{
                  clipPath: 'polygon(4px 0%, 100% 0%, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0% 100%, 0% 4px)',
                  background: 'rgba(var(--accent-rgb),0.02)',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Menu Items */}
            <div className="p-4 flex flex-col gap-3">
              {menuItems.map(item => {
                const active = isCurrentActive(item)
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 transition-all text-left relative overflow-hidden"
                    style={{
                      background: item.special
                        ? 'linear-gradient(135deg, var(--accent), var(--accent-2))'
                        : active
                          ? 'rgba(var(--accent-rgb),0.08)'
                          : 'rgba(0,0,0,0.45)',
                      border: item.special
                        ? '1px solid rgba(var(--accent-rgb),0.8)'
                        : active
                          ? '1px solid rgba(var(--accent-rgb),0.6)'
                          : '1px solid rgba(var(--accent-rgb),0.15)',
                      color: item.special
                        ? '#000'
                        : active
                          ? 'var(--accent)'
                          : '#9ca3af',
                      fontWeight: item.special || active ? 700 : 500,
                      clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)',
                      cursor: 'pointer',
                      boxShadow: (item.special || active) ? '0 0 10px rgba(var(--accent-rgb),0.2)' : 'none'
                    }}
                  >
                    {item.special && <div className="hud-stripe absolute top-0 left-0 right-0" style={{ height: 2 }} />}
                    
                    <item.icon size={18} className={active && !item.special ? 'text-orange-500' : ''} />
                    <span className="hud-title text-xs tracking-wider" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                      {item.special ? item.label.toUpperCase() : `// ${item.label.toUpperCase()}`}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-orange-500/10 flex flex-col items-center gap-1"
              style={{ background: 'rgba(0,0,0,0.3)', fontFamily: "'Share Tech Mono', monospace" }}>
              <div className="flex items-center gap-2">
                <span className="hud-dot active" style={{ width: 5, height: 5 }} />
                <span className="text-[9px] text-gray-500 tracking-wider">ADHD_CORE // ON_STANDBY</span>
              </div>
              <p className="text-[8px] text-gray-600">SYS_OPT_FRAME // v1.2.0</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
