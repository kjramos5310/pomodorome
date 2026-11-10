import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const cut = (n) => `polygon(${n}px 0%, 100% 0%, 100% calc(100% - ${n}px), calc(100% - ${n}px) 100%, 0% 100%, 0% ${n}px)`

// Aviso breve cuando el mundo del proyecto activo evoluciona de nivel
export default function WorldLevelToast({ info, onClose }) {
  useEffect(() => {
    if (!info) return
    const t = setTimeout(onClose, 6000)
    return () => clearTimeout(t)
  }, [info, onClose])

  return (
    <AnimatePresence>
      {info && (
        <div className="fixed top-20 left-0 right-0 z-[400] flex justify-center px-4 pointer-events-none">
          <motion.button
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={onClose}
            className="pointer-events-auto px-5 py-3 border text-center"
            style={{ clipPath: cut(10), background: 'var(--bg)', borderColor: 'var(--accent)', boxShadow: '0 0 30px rgba(var(--accent-rgb),0.45)', fontFamily: "'Rajdhani', sans-serif" }}
          >
            <p className="hud-label" style={{ color: 'var(--accent)' }}>// EL MUNDO EVOLUCIONA · NIVEL {info.level + 1}</p>
            <p className="text-xl font-bold text-white mt-0.5">{info.world.emoji} {info.world.levels[info.level - 1]?.name} → <span style={{ color: 'var(--accent)' }}>{info.name}</span></p>
          </motion.button>
        </div>
      )}
    </AnimatePresence>
  )
}
