import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const cut = (n) => `polygon(${n}px 0%, 100% 0%, 100% calc(100% - ${n}px), calc(100% - ${n}px) 100%, 0% 100%, 0% ${n}px)`

// Ancho de la ventana, para que el carrusel se adapte a móvil y escritorio
function useViewportWidth() {
  const [w, setW] = useState(() => window.innerWidth)
  useEffect(() => {
    const onResize = () => setW(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return w
}

/**
 * Carrusel 3D estilo coverflow (usado en Libros y Proyectos).
 * El ítem del centro se agranda y brilla; los laterales se inclinan.
 * Navegación: swipe, flechas, click en un lateral y ← → del teclado.
 */
export default function Coverflow({
  items,
  activeIndex,
  onChange,
  renderCard,            // (item, isActive) => JSX
  getColor = () => '#f97316',
  getLabel = (item) => item.title || item.name,
  ratio = 1.48,          // alto / ancho de cada tarjeta
  disableKeys = false,
}) {
  const vw = useViewportWidth()
  const active = Math.min(activeIndex, Math.max(0, items.length - 1))

  const cardW = vw < 640 ? 150 : 180
  const cardH = Math.round(cardW * ratio)
  const spacing = vw < 640 ? Math.min(105, vw * 0.27) : 150

  const go = (dir) => onChange(Math.max(0, Math.min(items.length - 1, active + dir)))

  useEffect(() => {
    if (disableKeys) return
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div className="relative z-10 select-none" style={{ height: cardH + 80 }}>
      {/* Marco del slot central */}
      <div
        className="absolute left-1/2 top-[36px] -translate-x-1/2 pointer-events-none"
        style={{ width: cardW + 20, height: cardH + 20, marginTop: -10, border: '1px solid rgba(var(--accent-rgb),0.18)', clipPath: cut(14) }}
      />
      <p className="absolute left-1/2 -translate-x-1/2 top-2 hud-label text-[9px]" style={{ color: 'rgba(var(--accent-rgb),0.6)' }}>
        ▼ {String(active + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
      </p>

      <motion.div
        className="absolute inset-0"
        style={{ perspective: 1100 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={(_, info) => {
          if (info.offset.x < -50 || info.velocity.x < -400) go(1)
          else if (info.offset.x > 50 || info.velocity.x > 400) go(-1)
        }}
      >
        {items.map((item, i) => {
          const offset = i - active
          const abs = Math.abs(offset)
          if (abs > 4) return null
          const color = getColor(item)
          return (
            <motion.button
              key={item.id}
              onClick={() => onChange(i)}
              className="absolute left-1/2 top-[36px] cursor-pointer"
              style={{ width: cardW, height: cardH, marginLeft: -cardW / 2, zIndex: 100 - abs, transformStyle: 'preserve-3d' }}
              initial={false}
              animate={{
                x: offset * spacing + (offset === 0 ? 0 : Math.sign(offset) * 20),
                scale: offset === 0 ? 1 : Math.max(0.6, 0.82 - (abs - 1) * 0.08),
                rotateY: offset === 0 ? 0 : offset > 0 ? -38 : 38,
                opacity: abs > 3 ? 0 : offset === 0 ? 1 : 0.75 - (abs - 1) * 0.2,
                filter: offset === 0 ? 'brightness(1)' : 'brightness(0.55)',
              }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              aria-label={getLabel(item)}
            >
              <div className="w-full h-full" style={offset === 0 ? { filter: `drop-shadow(0 0 18px ${color}66)` } : undefined}>
                {renderCard(item, offset === 0)}
              </div>
            </motion.button>
          )
        })}
      </motion.div>

      {/* Flechas */}
      <button
        onClick={() => go(-1)}
        disabled={active === 0}
        className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-[200] p-2 text-orange-400 border border-orange-500/25 bg-black/60 disabled:opacity-20"
        style={{ clipPath: cut(4) }}
        aria-label="Anterior"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={() => go(1)}
        disabled={active >= items.length - 1}
        className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-[200] p-2 text-orange-400 border border-orange-500/25 bg-black/60 disabled:opacity-20"
        style={{ clipPath: cut(4) }}
        aria-label="Siguiente"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
