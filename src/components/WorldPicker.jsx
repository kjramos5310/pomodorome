import { useState } from 'react'
import { motion } from 'framer-motion'
import { WORLD_LIST, worldOf, arcOf, levelFor, nextLevelInfo, LEVEL_THRESHOLDS } from '../lib/worlds'

const cut = (n) => `polygon(${n}px 0%, 100% 0%, 100% calc(100% - ${n}px), calc(100% - ${n}px) 100%, 0% 100%, 0% ${n}px)`

/**
 * Mundo del proyecto en su ficha: nivel actual, progreso al siguiente y
 * (desplegable) elegir mundo y arco. El arco es el nombre tras "||" en los títulos.
 */
export default function WorldPicker({ project, hours, onUpdate }) {
  const [open, setOpen] = useState(false)
  const [customArc, setCustomArc] = useState('')
  const world = worldOf(project)
  const level = levelFor(hours)
  const lvl = world.levels[level]
  const next = nextLevelInfo(world, hours)
  const span = next ? LEVEL_THRESHOLDS[level + 1] - LEVEL_THRESHOLDS[level] : 1
  const pct = next ? Math.min(100, ((hours - LEVEL_THRESHOLDS[level]) / span) * 100) : 100
  const arc = arcOf(project)

  const setArc = (a) => onUpdate({ ...project, world: world.id, arc: a })

  return (
    <div className="mt-4 p-3 border" style={{ clipPath: cut(8), borderColor: `${lvl.accent}55`, background: `linear-gradient(135deg, ${lvl.accent}14, transparent 70%)` }}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[9px] uppercase tracking-widest" style={{ color: lvl.accent }}>// Mundo · nivel {level + 1}</p>
          <p className="text-lg font-bold leading-tight truncate">{world.emoji} {lvl.name} <span className="text-gray-500 font-normal">|| {arc}</span></p>
        </div>
        <button onClick={() => setOpen(v => !v)} className="flex-shrink-0 px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider border" style={{ clipPath: cut(4), borderColor: `${lvl.accent}66`, color: lvl.accent }}>
          {open ? 'Listo' : 'Cambiar'}
        </button>
      </div>

      {/* Progreso al siguiente nivel */}
      <div className="mt-2">
        <div className="h-1.5 bg-black/60">
          <motion.div className="h-full" initial={false} animate={{ width: `${pct}%` }} style={{ background: lvl.accent, boxShadow: `0 0 8px ${lvl.accent}` }} />
        </div>
        <p className="font-mono text-[9px] text-gray-500 mt-1">
          {next ? `// ${next.hoursLeft.toFixed(1)}h para evolucionar a ${next.name}` : '// Nivel máximo alcanzado'}
        </p>
      </div>

      {open && (
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-3 gap-1.5">
            {WORLD_LIST.map(w => {
              const on = w.id === world.id
              const c = w.levels[0].accent
              return (
                <button key={w.id}
                  onClick={() => onUpdate({ ...project, world: w.id, arc: project.arc || project.name })}
                  className="p-2 border text-left"
                  style={{ clipPath: cut(5), borderColor: on ? c : 'rgba(255,255,255,0.08)', background: on ? `${c}1f` : w.bg }}>
                  <span className="flex gap-0.5 mb-1">
                    {w.levels.map((l, i) => <span key={i} className="h-1.5 flex-1" style={{ background: l.accent }} />)}
                  </span>
                  <span className="text-sm font-bold" style={{ color: on ? c : '#d1d5db' }}>{w.emoji} {w.name}</span>
                </button>
              )
            })}
          </div>
          <p className="text-[11px] text-gray-500 leading-snug">{world.tagline}</p>

          <div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-gray-500 mb-1">// Arco (lo que va tras “||”)</p>
            <div className="flex flex-wrap gap-1.5">
              {[project.name, ...world.arcs.filter(a => a !== project.name)].map(a => (
                <button key={a} onClick={() => setArc(a)}
                  className="px-2 py-1 text-xs border"
                  style={{ clipPath: cut(3), borderColor: arc === a ? lvl.accent : 'rgba(255,255,255,0.08)', color: arc === a ? lvl.accent : '#9ca3af' }}>
                  {a}
                </button>
              ))}
            </div>
            <div className="flex gap-1.5 mt-2">
              <input value={customArc} onChange={e => setCustomArc(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && customArc.trim()) { setArc(customArc.trim()); setCustomArc('') } }}
                placeholder="Otro arco…"
                className="flex-1 p-2 bg-black/60 border border-white/10 text-sm text-white placeholder-gray-600 focus:outline-none"
                style={{ clipPath: cut(4) }} />
              <button onClick={() => { if (customArc.trim()) { setArc(customArc.trim()); setCustomArc('') } }}
                disabled={!customArc.trim()} className="px-3 text-xs font-bold text-black disabled:opacity-30" style={{ clipPath: cut(4), background: lvl.accent }}>
                Usar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
