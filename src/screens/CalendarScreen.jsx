import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronLeft, ChevronRight, CalendarDays, Pencil, Plus, X } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { getLocalYMD } from '../lib/dates'
import { minutesByDay, startOf, minutesOf, fmtMinutes } from '../lib/stats'
import HudPanel from '../components/HudPanel'
import { sessionTitle } from '../lib/worlds'

const cut = (n) => `polygon(${n}px 0%, 100% 0%, 100% calc(100% - ${n}px), calc(100% - ${n}px) 100%, 0% 100%, 0% ${n}px)`

// Hábitos por defecto (se pueden editar desde la app)
const DEFAULT_HABITS = [
  { id: 'h-1', label: 'Gym / Ejercicio', emoji: '🏋️' },
  { id: 'h-2', label: 'Leer 30 min', emoji: '📖' },
  { id: 'h-3', label: 'Meditación', emoji: '🧘' },
  { id: 'h-4', label: 'Proyecto personal', emoji: '💻' },
  { id: 'h-5', label: 'Guitarra', emoji: '🎸' },
  { id: 'h-6', label: 'Inglés 20 min', emoji: '🌐' },
]
const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const DAY_NAMES_FULL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const HOUR_PX = 48 // alto de cada hora en la línea de tiempo

const fmtTime = (date) => date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

export default function CalendarScreen({ history, projects }) {
  const todayStr = getLocalYMD()

  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [weekOffset, setWeekOffset] = useState(0) // 0 = semana actual, -1 = anterior
  const [habits, setHabits] = useLocalStorage('calendar_habits', DEFAULT_HABITS)
  const [hobbyChecks, setHobbyChecks] = useLocalStorage('hobby_checks', {})
  const [editingHabits, setEditingHabits] = useState(false)
  const [newHabit, setNewHabit] = useState({ emoji: '✨', label: '' })
  const [openSession, setOpenSession] = useState(null)
  const timelineRef = useRef(null)

  const byDay = minutesByDay(history || [])
  const maxDay = Math.max(...Object.values(byDay), 1)

  // ── Semana (lunes a domingo) con desplazamiento ──
  const weekDays = (() => {
    const base = new Date()
    base.setDate(base.getDate() + weekOffset * 7)
    const monday = new Date(base)
    monday.setDate(base.getDate() - ((base.getDay() + 6) % 7))
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      return d
    })
  })()
  const weekLabel = (() => {
    const f = (d) => d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    return `${f(weekDays[0])} – ${f(weekDays[6])}`
  })()
  const weekMinutes = weekDays.reduce((s, d) => s + (byDay[getLocalYMD(d)] || 0), 0)

  // ── Sesiones del día seleccionado ──
  const sessionsOfDay = (history || [])
    .filter(e => getLocalYMD(e.date) === selectedDate)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
  const dayMinutes = sessionsOfDay.reduce((s, e) => s + minutesOf(e), 0)

  const blocks = sessionsOfDay.map(entry => {
    const startTime = startOf(entry)
    const endTime = new Date(entry.date)
    const startH = startTime.getHours() + startTime.getMinutes() / 60
    const endH = endTime.getHours() + endTime.getMinutes() / 60
    return {
      entry, startTime, endTime,
      top: Math.max(0, startH * HOUR_PX),
      height: Math.max(22, (endH - startH) * HOUR_PX),
      project: (projects || []).find(p => p.id === entry.projectId),
    }
  })

  // Al cambiar de día, llevar la línea de tiempo a la primera sesión (o a la hora actual)
  useEffect(() => {
    const el = timelineRef.current
    if (!el) return
    const first = blocks[0]
    const target = first ? first.top - HOUR_PX : (selectedDate === todayStr ? new Date().getHours() * HOUR_PX - 2 * HOUR_PX : 8 * HOUR_PX)
    el.scrollTo({ top: Math.max(0, target), behavior: 'smooth' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate])

  // ── Hábitos ──
  const toggleHabit = (id) => {
    const key = `${selectedDate}_${id}`
    setHobbyChecks(prev => ({ ...prev, [key]: !prev[key] }))
  }
  const isChecked = (id) => !!hobbyChecks[`${selectedDate}_${id}`]
  const doneCount = habits.filter(h => isChecked(h.id)).length
  const addHabit = () => {
    if (!newHabit.label.trim()) return
    setHabits(prev => [...prev, { id: `h-${Date.now().toString(36)}`, emoji: newHabit.emoji || '✨', label: newHabit.label.trim() }])
    setNewHabit({ emoji: '✨', label: '' })
  }
  const removeHabit = (id) => setHabits(prev => prev.filter(h => h.id !== id))

  const selDate = new Date(selectedDate + 'T12:00:00')
  const selectDay = (ds) => { setSelectedDate(ds); setOpenSession(null) }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-full pt-24 pb-10 px-4 sm:px-6 relative text-white"
      style={{ background: 'var(--bg)', fontFamily: "'Rajdhani', sans-serif" }}
    >
      <div className="hud-scanline" />
      <div className="max-w-xl mx-auto flex flex-col gap-5 relative z-10">

        {/* ── Título ── */}
        <div className="flex items-end justify-between">
          <div>
            <p className="hud-label" style={{ color: 'rgba(var(--accent-rgb),0.5)' }}>// REGISTRO_TEMPORAL</p>
            <h1 className="hud-title text-3xl mt-1 flex items-center gap-2">
              <CalendarDays size={26} className="text-orange-500" /> Calendario
            </h1>
            <p className="text-sm text-gray-500 font-mono mt-0.5">
              {DAY_NAMES_FULL[selDate.getDay()]}, {selDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
            </p>
          </div>
          {(weekOffset !== 0 || selectedDate !== todayStr) && (
            <button
              onClick={() => { setWeekOffset(0); selectDay(todayStr) }}
              className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-orange-400 border border-orange-500/30"
              style={{ clipPath: cut(6) }}
            >
              Hoy
            </button>
          )}
        </div>

        {/* ── Semana ── */}
        <HudPanel title="SEMANA" mod={weekLabel.toUpperCase()} id={`WK-${fmtMinutes(weekMinutes)}`} dotStatus={weekMinutes > 0 ? 'active' : 'idle'}>
          <div className="flex items-center gap-2">
            <button onClick={() => setWeekOffset(v => v - 1)} className="p-1.5 text-orange-400 border border-orange-500/20" style={{ clipPath: cut(4) }} aria-label="Semana anterior">
              <ChevronLeft size={16} />
            </button>
            <div className="flex-1 grid grid-cols-7 gap-1">
              {weekDays.map((d, i) => {
                const ds = getLocalYMD(d)
                const isToday = ds === todayStr
                const isSel = ds === selectedDate
                const m = byDay[ds] || 0
                const future = ds > todayStr
                return (
                  <button
                    key={i}
                    onClick={() => selectDay(ds)}
                    disabled={future}
                    className="flex flex-col items-center pt-1.5 pb-1 border transition-colors disabled:opacity-30"
                    style={{
                      clipPath: cut(4),
                      borderColor: isSel ? 'var(--accent)' : isToday ? 'rgba(var(--accent-rgb),0.35)' : 'rgba(255,255,255,0.05)',
                      background: isSel ? 'rgba(var(--accent-rgb),0.12)' : 'transparent',
                    }}
                  >
                    <span className="text-[9px] font-mono uppercase" style={{ color: isSel ? 'var(--accent)' : '#6b7280' }}>{DAY_NAMES[d.getDay()]}</span>
                    <span className={`text-lg font-bold leading-tight ${isSel ? 'text-white' : 'text-gray-400'}`}>{d.getDate()}</span>
                    {/* Barra de intensidad del día */}
                    <span className="w-3/4 h-[3px] mt-0.5" style={{ background: m ? 'var(--accent)' : 'rgba(255,255,255,0.06)', opacity: m ? 0.3 + 0.7 * (m / maxDay) : 1, boxShadow: m && isSel ? '0 0 6px var(--accent)' : 'none' }} />
                  </button>
                )
              })}
            </div>
            <button onClick={() => setWeekOffset(v => v + 1)} disabled={weekOffset >= 0} className="p-1.5 text-orange-400 border border-orange-500/20 disabled:opacity-20" style={{ clipPath: cut(4) }} aria-label="Semana siguiente">
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3 text-center font-mono">
            {[
              [fmtMinutes(dayMinutes), 'Enfoque del día'],
              [sessionsOfDay.length, 'Sesiones'],
              [`${doneCount}/${habits.length}`, 'Hábitos'],
            ].map(([v, l]) => (
              <div key={l} className="py-2 bg-neutral-950 border border-orange-500/10" style={{ clipPath: cut(5) }}>
                <p className="hud-value text-orange-400 text-base leading-none">{v}</p>
                <p className="text-[9px] text-gray-500 uppercase mt-1">{l}</p>
              </div>
            ))}
          </div>
        </HudPanel>

        {/* ── Hábitos ── */}
        <HudPanel title="HÁBITOS_DEL_DÍA" mod="HBT" id={`${doneCount}-${habits.length}`} dotStatus={doneCount === habits.length && habits.length ? 'active' : 'standby'}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1 h-1.5 bg-neutral-950 border border-orange-500/10 mr-3">
              <motion.div className="h-full bg-orange-500" animate={{ width: `${habits.length ? (doneCount / habits.length) * 100 : 0}%` }} />
            </div>
            <button
              onClick={() => setEditingHabits(v => !v)}
              className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-2 py-1 border"
              style={{ clipPath: cut(4), borderColor: editingHabits ? '#f97316' : 'rgba(249,115,22,0.2)', color: editingHabits ? '#f97316' : '#9ca3af' }}
            >
              {editingHabits ? <><Check size={11} /> Listo</> : <><Pencil size={11} /> Editar</>}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {habits.map(h => {
              const on = isChecked(h.id)
              return (
                <button
                  key={h.id}
                  onClick={() => (editingHabits ? removeHabit(h.id) : toggleHabit(h.id))}
                  className="flex items-center gap-2 p-2.5 text-left border transition-colors"
                  style={{
                    clipPath: cut(6),
                    borderColor: editingHabits ? 'rgba(239,68,68,0.3)' : on ? 'rgba(var(--accent-rgb),0.5)' : 'rgba(255,255,255,0.06)',
                    background: on && !editingHabits ? 'rgba(var(--accent-rgb),0.08)' : 'rgba(0,0,0,0.4)',
                  }}
                >
                  <span className="w-4 h-4 flex items-center justify-center flex-shrink-0 border"
                    style={{ borderColor: editingHabits ? '#ef4444' : on ? '#f97316' : '#4b5563', background: on && !editingHabits ? '#f97316' : 'transparent' }}>
                    {editingHabits ? <X size={10} className="text-red-400" /> : on && <Check size={10} className="text-black" />}
                  </span>
                  <span className="text-base">{h.emoji}</span>
                  <span className={`text-xs leading-tight ${on && !editingHabits ? 'text-gray-500 line-through' : 'text-gray-300'}`}>{h.label}</span>
                </button>
              )
            })}
          </div>

          {editingHabits && (
            <div className="flex gap-2 mt-2">
              <input
                value={newHabit.emoji}
                onChange={e => setNewHabit(v => ({ ...v, emoji: e.target.value.slice(0, 4) }))}
                className="w-12 p-2 text-center bg-black/60 border border-orange-500/20 focus:outline-none focus:border-orange-500/60"
                style={{ clipPath: cut(4) }}
                aria-label="Emoji del hábito"
              />
              <input
                value={newHabit.label}
                onChange={e => setNewHabit(v => ({ ...v, label: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addHabit()}
                placeholder="Nuevo hábito…"
                className="flex-1 p-2 text-sm bg-black/60 border border-orange-500/20 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/60"
                style={{ clipPath: cut(4) }}
              />
              <button onClick={addHabit} disabled={!newHabit.label.trim()} className="px-3 bg-orange-500 text-black disabled:opacity-30" style={{ clipPath: cut(4) }} aria-label="Añadir hábito">
                <Plus size={16} />
              </button>
            </div>
          )}
          {editingHabits && <p className="text-[10px] font-mono text-gray-500 mt-2">// Toca un hábito para quitarlo. El historial de checks se conserva.</p>}
        </HudPanel>

        {/* ── Línea de tiempo ── */}
        <HudPanel title="SESIONES_DEL_DÍA" mod="TML" id={`${sessionsOfDay.length}S`} dotStatus={sessionsOfDay.length ? 'active' : 'idle'}>
          <div ref={timelineRef} className="relative overflow-y-auto border border-orange-500/10 bg-black/40" style={{ height: 380 }}>
            <div className="relative" style={{ height: 24 * HOUR_PX }}>
              {Array.from({ length: 25 }, (_, i) => (
                <div key={i} className="absolute left-0 right-0 flex items-center" style={{ top: i * HOUR_PX }}>
                  <span className="text-[9px] font-mono text-gray-600 w-11 text-right pr-2 flex-shrink-0 select-none -translate-y-1/2">
                    {i < 24 ? `${String(i).padStart(2, '0')}:00` : ''}
                  </span>
                  <div className="flex-1 border-t" style={{ borderColor: i % 6 === 0 ? 'rgba(var(--accent-rgb),0.18)' : 'rgba(255,255,255,0.04)' }} />
                </div>
              ))}

              {/* Hora actual */}
              {selectedDate === todayStr && (() => {
                const now = new Date()
                return (
                  <div className="absolute left-11 right-0 flex items-center z-10 pointer-events-none" style={{ top: (now.getHours() + now.getMinutes() / 60) * HOUR_PX }}>
                    <span className="w-2 h-2 bg-red-500 -ml-1 rotate-45" style={{ boxShadow: '0 0 6px #ef4444' }} />
                    <div className="flex-1 border-t border-red-500/60" />
                  </div>
                )
              })()}

              {blocks.map(({ top, height, entry, project, startTime, endTime }, idx) => {
                const open = openSession === entry.id
                return (
                  <motion.button
                    key={entry.id || idx}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    onClick={() => setOpenSession(open ? null : entry.id)}
                    className="absolute left-12 right-2 px-2.5 py-1 overflow-hidden z-20 text-left"
                    style={{
                      top, height,
                      clipPath: cut(5),
                      background: open ? 'rgba(var(--accent-rgb),0.35)' : 'linear-gradient(135deg, rgba(var(--accent-rgb),0.25), rgba(var(--accent-rgb),0.08))',
                      borderLeft: '3px solid var(--accent)',
                    }}
                  >
                    <p className="text-[11px] font-bold text-orange-300 truncate leading-tight">{project?.emoji || entry.projectEmoji || '🎯'} {sessionTitle(entry, history, projects || []) || entry.projectName}</p>
                    {height > 30 && <p className="text-[9px] font-mono text-gray-400">{fmtTime(startTime)} – {fmtTime(endTime)} · {Math.round(minutesOf(entry))} min</p>}
                  </motion.button>
                )
              })}

              {blocks.length === 0 && (
                <div className="absolute left-12 right-2 flex flex-col items-center justify-center gap-1 text-gray-600 pointer-events-none" style={{ top: 9 * HOUR_PX, height: 3 * HOUR_PX }}>
                  <CalendarDays size={22} className="opacity-40" />
                  <p className="text-xs font-mono uppercase opacity-60">// Sin sesiones este día</p>
                </div>
              )}
            </div>
          </div>

          {/* Detalle de la sesión tocada */}
          <AnimatePresence>
            {openSession && (() => {
              const e = sessionsOfDay.find(s => s.id === openSession)
              if (!e) return null
              const questions = (e.questions || []).filter(Boolean)
              const synth = e.synthesis?.explanation
              return (
                <motion.div
                  key={openSession}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 p-3 border border-orange-500/25 bg-neutral-950 space-y-2" style={{ clipPath: cut(8) }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold">{sessionTitle(e, history, projects || []) || e.projectName}</p>
                        <p className="text-xs text-gray-500">{e.projectEmoji || '🎯'} {e.projectName}</p>
                      </div>
                      <button onClick={() => setOpenSession(null)} className="text-gray-500 hover:text-orange-400" aria-label="Cerrar detalle"><X size={14} /></button>
                    </div>
                    <p className="text-[11px] font-mono text-gray-400">
                      {fmtTime(startOf(e))} – {fmtTime(new Date(e.date))} · {Math.round(minutesOf(e))} min{e.mood ? ` · mood: ${e.mood}` : ''}
                    </p>
                    {e.sessionObjective && <Detail label="Objetivo">{e.sessionObjective}</Detail>}
                    {questions.length > 0 && (
                      <Detail label="Preguntas">
                        <ul className="list-disc pl-4 space-y-0.5">{questions.map((q, i) => <li key={i}>{q}</li>)}</ul>
                      </Detail>
                    )}
                    {synth && <Detail label="Síntesis">{synth}</Detail>}
                    {e.notes && <Detail label="Notas"><span className="whitespace-pre-line">{e.notes}</span></Detail>}
                    {e.evidence?.content && <Detail label="Evidencia">{e.evidence.content}</Detail>}
                  </div>
                </motion.div>
              )
            })()}
          </AnimatePresence>
          {blocks.length > 0 && !openSession && <p className="text-[10px] font-mono text-gray-600 mt-2">// Toca una sesión para ver su objetivo, preguntas y síntesis</p>}
        </HudPanel>
      </div>
    </motion.div>
  )
}

function Detail({ label, children }) {
  return (
    <div>
      <p className="hud-label text-[9px] text-orange-400/70">// {label}</p>
      <div className="text-sm text-gray-300 leading-snug">{children}</div>
    </div>
  )
}
