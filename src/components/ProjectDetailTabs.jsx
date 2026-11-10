import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Check, ChevronUp, ChevronDown, X, Flag, MessageCircleQuestion } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { routeProgress, newStepId, weeklyMinutes, projectPace, openQuestions } from '../lib/projectStats'
import { fmtMinutes } from '../lib/stats'
import { sessionTitle } from '../lib/worlds'

const cut = (n) => `polygon(${n}px 0%, 100% 0%, 100% calc(100% - ${n}px), calc(100% - ${n}px) 100%, 0% 100%, 0% ${n}px)`
const fmtDate = (d) => new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })

/**
 * Pestañas de la ficha de un proyecto:
 *  RUTA      → lista ordenada de pasos (el siguiente alimenta el objetivo y el embrague)
 *  RITMO     → horas por semana y si llegas a la meta en el plazo
 *  BITÁCORA  → preguntas abiertas y lo que dejó cada sesión
 */
export default function ProjectDetailTabs({ project, entries, onUpdate, onFinishProject, history = [], projects = [] }) {
  const [tab, setTab] = useState('ruta')
  const route = routeProgress(project)

  return (
    <div className="mt-4">
      <div className="flex border-b border-orange-500/15">
        {[['ruta', `Ruta${route.total ? ` ${route.done}/${route.total}` : ''}`], ['ritmo', 'Ritmo'], ['bitacora', 'Bitácora']].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="flex-1 py-2 text-[11px] font-mono uppercase tracking-widest transition-colors -mb-px border-b-2"
            style={{ color: tab === id ? '#f97316' : '#6b7280', borderColor: tab === id ? '#f97316' : 'transparent' }}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="pt-3">
        {tab === 'ruta' && <RouteTab project={project} onUpdate={onUpdate} onFinishProject={onFinishProject} />}
        {tab === 'ritmo' && <PaceTab project={project} entries={entries} />}
        {tab === 'bitacora' && <LogTab entries={entries} history={history} projects={projects} />}
      </div>
    </div>
  )
}

// ─── RUTA ─────────────────────────────────────────────────────────────────
function RouteTab({ project, onUpdate, onFinishProject }) {
  const [nextSteps] = useLocalStorage('ignition_next_steps', {})
  const [draft, setDraft] = useState('')
  const [editing, setEditing] = useState(null) // { id, text }
  const [showDone, setShowDone] = useState(false)
  const steps = project.steps || []
  const { done, total, next } = routeProgress(project)
  const save = (newSteps) => onUpdate({ ...project, steps: newSteps })

  const add = () => {
    const lines = draft.split('\n').map(l => l.replace(/^[-*•\d.)\s]+/, '').trim()).filter(Boolean)
    if (!lines.length) return
    save([...steps, ...lines.map(text => ({ id: newStepId(), text, done: false }))])
    setDraft('')
  }
  const toggle = (id) => save(steps.map(s => s.id === id ? { ...s, done: !s.done, doneAt: !s.done ? new Date().toISOString() : null } : s))
  const remove = (id) => save(steps.filter(s => s.id !== id))
  const move = (id, dir) => {
    const pending = steps.filter(s => !s.done)
    const i = pending.findIndex(s => s.id === id), j = i + dir
    if (j < 0 || j >= pending.length) return
    ;[pending[i], pending[j]] = [pending[j], pending[i]]
    save([...steps.filter(s => s.done), ...pending])
  }
  const commitEdit = () => {
    if (editing?.text.trim()) save(steps.map(s => s.id === editing.id ? { ...s, text: editing.text.trim() } : s))
    setEditing(null)
  }

  const pending = steps.filter(s => !s.done)
  const completed = steps.filter(s => s.done)

  return (
    <div className="space-y-3">
      {nextSteps[project.id] && (
        <div className="p-2.5 border border-yellow-400/25 bg-yellow-400/5 text-xs" style={{ clipPath: cut(5) }}>
          <span className="font-mono text-[9px] uppercase tracking-widest text-yellow-400/80">⚡ Arranque guardado (Chispa → Motor)</span>
          <p className="text-gray-200 mt-0.5">{nextSteps[project.id]}</p>
        </div>
      )}

      {total > 0 && (
        <div>
          <div className="flex justify-between font-mono text-[10px] text-gray-500 mb-1">
            <span>// {done} de {total} pasos</span><span className="text-orange-400">{Math.round((done / total) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-neutral-950 border border-orange-500/10">
            <motion.div className="h-full bg-orange-500" initial={false} animate={{ width: `${(done / total) * 100}%` }} />
          </div>
        </div>
      )}

      {/* Pendientes */}
      <div className="space-y-1.5">
        {pending.map((s, i) => {
          const isNext = s.id === next?.id
          return (
            <div key={s.id} className="flex items-center gap-2 px-2 py-2 border group"
              style={{ clipPath: cut(5), borderColor: isNext ? 'rgba(var(--accent-rgb),0.6)' : 'rgba(255,255,255,0.06)', background: isNext ? 'rgba(var(--accent-rgb),0.07)' : 'rgba(0,0,0,0.3)' }}>
              <button onClick={() => toggle(s.id)} className="w-5 h-5 border flex-shrink-0 hover:border-orange-400" style={{ borderColor: isNext ? 'var(--accent)' : '#4b5563' }} aria-label={`Completar: ${s.text}`} />
              <div className="flex-1 min-w-0">
                {isNext && <p className="font-mono text-[8px] tracking-widest text-orange-400">▶ SIGUIENTE PASO</p>}
                {editing?.id === s.id ? (
                  <input autoFocus value={editing.text} onChange={e => setEditing({ ...editing, text: e.target.value })}
                    onBlur={commitEdit} onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(null) }}
                    className="w-full bg-black/60 border border-orange-500/40 px-1.5 py-0.5 text-sm text-white focus:outline-none" />
                ) : (
                  <button onClick={() => setEditing({ id: s.id, text: s.text })} className={`text-left text-sm leading-snug w-full ${isNext ? 'text-white font-semibold' : 'text-gray-300'}`}>
                    {s.text}
                  </button>
                )}
              </div>
              <div className="flex flex-col flex-shrink-0">
                <button onClick={() => move(s.id, -1)} disabled={i === 0} className="text-gray-600 hover:text-orange-400 disabled:opacity-20" aria-label="Subir paso"><ChevronUp size={14} /></button>
                <button onClick={() => move(s.id, 1)} disabled={i === pending.length - 1} className="text-gray-600 hover:text-orange-400 disabled:opacity-20" aria-label="Bajar paso"><ChevronDown size={14} /></button>
              </div>
              <button onClick={() => remove(s.id)} className="text-gray-600 hover:text-red-400 flex-shrink-0" aria-label={`Quitar: ${s.text}`}><X size={14} /></button>
            </div>
          )
        })}
      </div>

      {total === 0 && (
        <p className="text-xs text-gray-500">
          Divide el proyecto en pasos pequeños y concretos. El primero pendiente se te sugiere como objetivo al iniciar un deepwork y como primer paso en el embrague, así no pierdes tiempo decidiendo qué hacer.
        </p>
      )}

      {total > 0 && pending.length === 0 && (
        <div className="p-3 border border-green-500/40 bg-green-500/5 text-center" style={{ clipPath: cut(6) }}>
          <p className="text-sm text-green-300 font-bold">🏁 Ruta completa</p>
          {project.status !== 'done' && (
            <button onClick={onFinishProject} className="mt-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-green-500 text-black flex items-center gap-1.5 mx-auto" style={{ clipPath: cut(4) }}>
              <Flag size={12} /> Marcar proyecto como terminado
            </button>
          )}
        </div>
      )}

      {/* Añadir (acepta varias líneas: una por paso) */}
      <div className="flex gap-2 items-start">
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); add() } }}
          rows={1}
          placeholder="Añadir paso…"
          className="flex-1 p-2 bg-black/60 border border-orange-500/20 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/60 resize-none"
          style={{ clipPath: cut(4) }}
        />
        <button onClick={add} disabled={!draft.trim()} className="p-2 bg-orange-500 text-black disabled:opacity-30" style={{ clipPath: cut(4) }} aria-label="Añadir paso">
          <Plus size={16} />
        </button>
      </div>

      <p className="font-mono text-[9px] text-gray-600 -mt-1.5">// Tip: pega una lista (una línea por paso) para añadir varios a la vez</p>

      {/* Completados */}
      {completed.length > 0 && (
        <div>
          <button onClick={() => setShowDone(v => !v)} className="font-mono text-[10px] uppercase tracking-widest text-gray-500 hover:text-gray-300">
            {showDone ? '▾' : '▸'} {completed.length} completado(s)
          </button>
          {showDone && (
            <div className="space-y-1 mt-1.5">
              {completed.map(s => (
                <div key={s.id} className="flex items-center gap-2 px-2 py-1.5 text-sm">
                  <button onClick={() => toggle(s.id)} className="w-5 h-5 flex items-center justify-center bg-green-500/80 flex-shrink-0" aria-label={`Reabrir: ${s.text}`}>
                    <Check size={12} className="text-black" />
                  </button>
                  <span className="flex-1 text-gray-500 line-through">{s.text}</span>
                  {s.doneAt && <span className="font-mono text-[9px] text-gray-600">{fmtDate(s.doneAt)}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── RITMO ────────────────────────────────────────────────────────────────
function PaceTab({ project, entries }) {
  const [now] = useState(() => new Date())
  const weeks = weeklyMinutes(entries, 8, now)
  const max = Math.max(...weeks.map(w => w.minutes), 1)
  const pace = projectPace(project, entries, now)

  const verdict = {
    done: { color: '#22c55e', text: '¡Meta de horas cumplida! 🎯' },
    no_deadline: { color: '#9ca3af', text: 'Este proyecto no tiene plazo definido.' },
    no_data: { color: '#9ca3af', text: 'Sin sesiones en las últimas 2 semanas. Un bloque lo pone en marcha.' },
    on_track: { color: '#22c55e', text: `A tu ritmo actual llegas a la meta el ${pace.projectedDate ? fmtDate(pace.projectedDate) : '—'}, dentro del plazo.` },
    needs_push: { color: '#eab308', text: `Para llegar en plazo: ~${fmtMinutes(pace.neededMinPerDay || 0)} al día. A tu ritmo actual llegarías el ${pace.projectedDate ? fmtDate(pace.projectedDate) : '—'}.` },
    deadline_passed: { color: '#9ca3af', text: `El plazo ya pasó y faltan ${pace.leftH.toFixed(1)}h. Puedes extenderlo o ajustar la meta: es información, no un fracaso.` },
  }[pace.status]

  return (
    <div className="space-y-4">
      <div>
        <p className="hud-label mb-2">// Horas por semana (últimas 8)</p>
        <div className="flex items-end gap-1.5 h-24">
          {weeks.map((w, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
              {w.minutes > 0 && <span className="font-mono text-[8px] text-gray-500">{(w.minutes / 60).toFixed(1)}</span>}
              <motion.div
                className="w-full"
                initial={{ height: 0 }}
                animate={{ height: `${(w.minutes / max) * 100}%` }}
                style={{ minHeight: w.minutes ? 3 : 1, background: w.current ? 'var(--accent)' : w.minutes ? 'rgba(var(--accent-rgb),0.45)' : 'rgba(255,255,255,0.06)', boxShadow: w.current && w.minutes ? '0 0 8px rgba(var(--accent-rgb),0.6)' : 'none' }}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-1.5 mt-1">
          {weeks.map((w, i) => (
            <span key={i} className="flex-1 text-center font-mono text-[8px] text-gray-600">{w.current ? 'HOY' : fmtDate(w.start).replace('.', '')}</span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          [`${pace.doneH.toFixed(1)}h`, `de ${pace.goalH || '—'}h`],
          [pace.daysLeft === null ? '—' : pace.daysLeft > 0 ? pace.daysLeft : 0, 'días restantes'],
          [fmtMinutes(pace.recentMinPerDay), 'ritmo/día (14d)'],
        ].map(([v, l]) => (
          <div key={l} className="py-2 bg-neutral-950 border border-orange-500/10" style={{ clipPath: cut(5) }}>
            <p className="hud-value text-orange-400 text-base leading-none">{v}</p>
            <p className="text-[9px] font-mono text-gray-500 uppercase mt-1">{l}</p>
          </div>
        ))}
      </div>

      <p className="text-sm p-3 border-l-2" style={{ borderColor: verdict.color, color: '#d1d5db', background: 'rgba(0,0,0,0.3)' }}>
        {verdict.text}
      </p>
    </div>
  )
}

// ─── BITÁCORA ─────────────────────────────────────────────────────────────
function LogTab({ entries, history, projects }) {
  const [open, setOpen] = useState(null)
  const questions = openQuestions(entries)
  const sessions = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 12)

  return (
    <div className="space-y-4">
      <div>
        <p className="hud-label mb-1.5 flex items-center gap-1.5"><MessageCircleQuestion size={11} /> Preguntas abiertas</p>
        {questions.length === 0 ? (
          <p className="text-xs text-gray-500">Las preguntas que aparques en Chispa → Motor y las partes donde te trabes en la síntesis aparecerán aquí.</p>
        ) : (
          <div className="space-y-1">
            {questions.slice(0, 8).map((q, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="font-mono text-[9px] mt-1 px-1 border flex-shrink-0" style={{ color: q.kind === 'aparcada' ? '#facc15' : '#f87171', borderColor: q.kind === 'aparcada' ? '#facc1555' : '#f8717155' }}>
                  {q.kind === 'aparcada' ? 'APARCADA' : 'TRABADO'}
                </span>
                <span className="text-gray-300 flex-1">{q.text}</span>
                <span className="font-mono text-[9px] text-gray-600 mt-1">{fmtDate(q.date)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="hud-label mb-1.5">// Sesiones</p>
        {sessions.length === 0 && <p className="text-xs text-gray-500">Todavía no hay sesiones en este proyecto.</p>}
        <div className="space-y-1.5">
          {sessions.map(e => {
            const isOpen = open === e.id
            const synth = e.synthesis?.explanation
            return (
              <div key={e.id} className="border border-orange-500/10 bg-neutral-950/60" style={{ clipPath: cut(4) }}>
                <button onClick={() => setOpen(isOpen ? null : e.id)} className="w-full flex items-center gap-2 px-3 py-2 font-mono text-[11px] text-left">
                  <span className="text-gray-300 flex-shrink-0">{new Date(e.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                  {e.type === 'ignition' && <span className="text-yellow-400 flex-shrink-0">⚡</span>}
                  <span className="text-gray-300 truncate flex-1">{sessionTitle(e, history.length ? history : entries, projects) || e.sessionObjective || ''}</span>
                  <span className="text-orange-400 font-bold flex-shrink-0">{Math.round((e.duration || 0) / 60)} min</span>
                </button>
                {isOpen && (
                  <div className="px-3 pb-3 space-y-1.5 text-sm">
                    {e.sessionObjective && <Field label="Objetivo">{e.sessionObjective}</Field>}
                    {synth && <Field label={e.type === 'ignition' ? 'Puente' : 'Síntesis'}>{synth}</Field>}
                    {e.evidence?.content && <Field label="Evidencia">{e.evidence.content}</Field>}
                    {e.notes && <Field label="Notas"><span className="whitespace-pre-line">{e.notes}</span></Field>}
                    {!e.sessionObjective && !synth && !e.notes && !e.evidence?.content && <p className="text-xs text-gray-600">Sin notas en esta sesión.</p>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <p className="font-mono text-[9px] uppercase tracking-widest text-orange-400/70">// {label}</p>
      <div className="text-gray-300 leading-snug">{children}</div>
    </div>
  )
}
