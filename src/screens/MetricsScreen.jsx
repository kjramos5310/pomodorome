import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import { getLocalYMD, getLocalYMDH } from '../lib/dates'
import {
  minutesByDay, lastDays, weekComparison, streaks, activeDaysThisMonth,
  minutesByHour, bestWindow, avgByWeekday, minutesByProject, fmtMinutes, minutesOf,
} from '../lib/stats'
import HudPanel from '../components/HudPanel'
import { useWorld } from '../lib/worldContext'

const cut = (n) => `polygon(${n}px 0%, 100% 0%, 100% calc(100% - ${n}px), calc(100% - ${n}px) 100%, 0% 100%, 0% ${n}px)`
const WEEKDAYS_SHORT = ['D', 'L', 'M', 'X', 'J', 'V', 'S']
const WEEKDAYS_FULL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const hh = (h) => `${String(h % 24).padStart(2, '0')}:00`

// ─── Gráfico de barras HUD con valor al tocar ─────────────────────────────
function BarChart({ data, height = 110, highlight = () => false, color: colorProp }) {
  const theme = useWorld()
  const color = colorProp || theme.accent
  const [sel, setSel] = useState(null)
  const max = Math.max(...data.map(d => d.value), 1)
  const shown = sel !== null ? data[sel] : null
  return (
    <div>
      <div className="h-5 mb-1 text-center font-mono text-[11px]">
        {shown ? (
          <span><span className="text-gray-500">{shown.title}: </span><span className="text-orange-400 font-bold">{fmtMinutes(shown.value)}</span></span>
        ) : (
          <span className="text-gray-600">// toca una barra para ver el detalle</span>
        )}
      </div>
      <div className="relative flex items-end gap-[3px]" style={{ height }}>
        {[0.5, 1].map(f => (
          <div key={f} className="absolute left-0 right-0 border-t border-dashed pointer-events-none" style={{ bottom: `${f * 100}%`, borderColor: 'rgba(var(--accent-rgb),0.12)' }} />
        ))}
        <span className="absolute -top-1 right-0 font-mono text-[9px] text-gray-600 -translate-y-full">{fmtMinutes(max)}</span>
        {data.map((d, i) => {
          const h = d.value > 0 ? Math.max(4, (d.value / max) * 100) : 0
          const hot = highlight(d, i)
          return (
            <button
              key={i}
              onClick={() => setSel(sel === i ? null : i)}
              className="flex-1 h-full flex items-end group"
              aria-label={`${d.title}: ${fmtMinutes(d.value)}`}
            >
              <motion.div
                className="w-full"
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ duration: 0.5, delay: i * 0.01 }}
                style={{
                  background: sel === i ? '#fff' : hot ? color : `${color}66`,
                  boxShadow: hot || sel === i ? `0 0 8px ${color}99` : 'none',
                  minHeight: d.value > 0 ? 3 : 0,
                }}
              />
              {d.value === 0 && <div className="w-full h-[2px]" style={{ background: 'rgba(255,255,255,0.06)' }} />}
            </button>
          )
        })}
      </div>
      <div className="flex gap-[3px] mt-1.5">
        {data.map((d, i) => (
          <span key={i} className="flex-1 text-center font-mono text-[9px] text-gray-500 uppercase truncate">{d.label}</span>
        ))}
      </div>
    </div>
  )
}

function Stat({ value, label, sub }) {
  return (
    <div className="p-3 bg-neutral-950 border border-orange-500/10 text-center" style={{ clipPath: cut(6) }}>
      <p className="hud-value text-orange-400 text-xl leading-none">{value}</p>
      <p className="text-[9px] font-mono text-gray-500 uppercase mt-1.5 tracking-wider">{label}</p>
      {sub && <p className="text-[9px] font-mono text-gray-600 mt-0.5">{sub}</p>}
    </div>
  )
}

// METRICS SCREEN
export default function MetricsScreen({ history, projects, currentRank, currentLevel, xp, nextLevelXP, progressToNext, getNextRank }) {
  const [activeTab, setActiveTab] = useState('weekly')

  const nextRank = getNextRank ? getNextRank(currentLevel) : null;
  const xpNeededForNextRank = nextRank ? (10 * Math.pow(nextRank.min - 1, 2)) - xp : 0;

  const now = new Date()
  const byDay = minutesByDay(history)

  // ── Resumen 7 días ──
  const { current: week, previous: prevWeek } = weekComparison(history, now)
  const diffMin = week.minutes - prevWeek.minutes

  // ── Rachas ──
  const { current: currentStreak, best: bestStreak } = streaks(history, now)
  const monthDays = activeDaysThisMonth(history, now)

  // ── Gráfico por pestaña ──
  const chartByTab = {
    daily: () => Array.from({ length: 24 }, (_, i) => {
      const d = new Date(now); d.setHours(d.getHours() - (23 - i))
      const key = getLocalYMDH(d)
      const value = history.filter(e => getLocalYMDH(e.date) === key).reduce((s, e) => s + minutesOf(e), 0)
      return { title: `${hh(d.getHours())}`, label: i % 6 === 0 ? hh(d.getHours()).slice(0, 2) : '', value }
    }),
    weekly: () => lastDays(7, now).map(d => {
      const date = new Date(d + 'T12:00')
      return { title: date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' }), label: date.toLocaleDateString('es-ES', { weekday: 'short' }).slice(0, 3), value: byDay[d] || 0, today: d === getLocalYMD(now) }
    }),
    monthly: () => lastDays(30, now).map((d, i) => {
      const date = new Date(d + 'T12:00')
      return { title: date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }), label: i % 6 === 0 ? String(date.getDate()) : '', value: byDay[d] || 0, today: d === getLocalYMD(now) }
    }),
  }
  const chartData = chartByTab[activeTab]()
  const chartTotal = chartData.reduce((s, d) => s + d.value, 0)
  const chartActive = chartData.filter(d => d.value > 0).length

  // ── Ritmo ──
  const byHour = minutesByHour(history)
  const window2h = bestWindow(byHour, 2)
  const weekdayAvg = avgByWeekday(history)
  const bestWeekday = weekdayAvg.some(v => v > 0) ? weekdayAvg.indexOf(Math.max(...weekdayAvg)) : null
  const totalMin = history.reduce((s, e) => s + minutesOf(e), 0)
  const avgSession = history.length ? totalMin / history.length : 0

  // ── Matriz de actividad (16 semanas, lunes a domingo) ──
  const WEEKS = 16
  const maxDay = Math.max(...Object.values(byDay), 1)
  const todayIdx = (now.getDay() + 6) % 7 // 0 = lunes
  const monday = new Date(now); monday.setDate(now.getDate() - todayIdx - (WEEKS - 1) * 7)
  const matrix = Array.from({ length: WEEKS }, (_, w) => Array.from({ length: 7 }, (_, d) => {
    const date = new Date(monday); date.setDate(monday.getDate() + w * 7 + d)
    if (date > now) return null
    const key = getLocalYMD(date)
    const m = byDay[key] || 0
    const r = m / maxDay
    return { key, date, m, level: m === 0 ? 0 : r <= 0.25 ? 1 : r <= 0.5 ? 2 : r <= 0.75 ? 3 : 4 }
  }))
  const levelStyle = (l) => [
    { background: '#111', border: '1px solid #1f1f1f' },
    { background: 'rgba(var(--accent-rgb),0.18)', border: '1px solid rgba(var(--accent-rgb),0.12)' },
    { background: 'rgba(var(--accent-rgb),0.4)', border: '1px solid rgba(var(--accent-rgb),0.25)' },
    { background: 'rgba(var(--accent-rgb),0.7)', border: '1px solid rgba(var(--accent-rgb),0.45)' },
    { background: 'var(--accent)', border: '1px solid var(--accent-strong)', boxShadow: '0 0 6px rgba(var(--accent-rgb),0.6)' },
  ][l]
  const [cell, setCell] = useState(null)

  // ── Proyectos ──
  const perProject = minutesByProject(history, projects).filter(p => p.minutes > 0 || p.project.status !== 'done')
  const maxProject = Math.max(...perProject.map(p => p.minutes), 1)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-full pt-24 pb-10 px-4 sm:px-6 relative text-white"
      style={{ background: 'var(--bg)', fontFamily: "'Rajdhani', sans-serif" }}
    >
      <div className="hud-scanline" />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(var(--accent-rgb),0.03) 0%, transparent 70%)'
      }} />

      <div className="max-w-xl mx-auto flex flex-col gap-5 z-10 relative">

        {/* PROFILE CARD - Styled as HudPanel */}
        <HudPanel title="ESTADO_DEL_PILOTO" mod="PLT-X01" id="0001-P" dotStatus="active" className="w-full">
          <div className="relative z-10 flex flex-col items-center py-2">
            
            {/* Rank Info */}
            <div className="mb-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className={`text-3xl ${currentRank.color}`}>{currentRank.symbol}</span>
                <h2 className={`text-2xl font-bold tracking-wider ${currentRank.color} uppercase`}>{currentRank.name}</h2>
              </div>
              <p className="text-xs text-gray-400 font-mono tracking-wider mb-2">// {currentRank.title.toUpperCase()}</p>

              <div className="inline-flex items-center gap-3 text-[10px] font-mono text-orange-400 border border-orange-500/25 px-3 py-1 bg-black"
                style={{ clipPath: 'polygon(4px 0%, 100% 0%, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0% 100%, 0% 4px)' }}>
                <span>LVL {currentLevel}</span>
                <span>•</span>
                <span>{Math.floor(xp)} / {nextLevelXP} XP</span>
              </div>
            </div>

            {/* Avatar GIF with styled ring */}
            <div className="w-48 h-48 border border-orange-500/35 overflow-hidden mb-4 bg-neutral-950 p-1.5"
              style={{ clipPath: 'polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)' }}>
              <div className="w-full h-full overflow-hidden"
                style={{ clipPath: 'polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)' }}>
                <img src={currentRank.img} alt="Avatar" className="w-full h-full object-cover opacity-85" />
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-xs bg-neutral-950 border border-orange-500/10 h-2.5 overflow-hidden mb-1"
              style={{ clipPath: 'polygon(2px 0%, 100% 0%, 100% calc(100% - 2px), calc(100% - 2px) 100%, 0% 100%, 0% 2px)' }}>
              <motion.div
                className="h-full bg-gradient-to-r from-orange-500 to-[var(--accent-2)]"
                initial={{ width: 0 }}
                animate={{ width: `${progressToNext}%` }}
              />
            </div>
            <p className="text-[9px] font-mono text-gray-500 mb-4">
              // FALTA {Math.round(nextLevelXP - xp)} XP PARA EL RANGO SIGUIENTE
            </p>

            {/* Next Rank Info */}
            {nextRank && (
              <div className="w-full max-w-sm border border-orange-500/15 bg-black/40 p-3 flex flex-col justify-between"
                style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}>
                <p className="text-[8px] font-mono text-gray-500 uppercase tracking-widest mb-2 border-b border-orange-500/5 pb-1">
                  // MEJORA_PROMETIDA
                </p>
                <div className="flex items-center gap-3">
                  <span className={`text-2xl ${nextRank.color}`}>{nextRank.symbol}</span>
                  <div>
                    <h4 className={`text-sm font-bold ${nextRank.color} leading-none uppercase`}>{nextRank.name}</h4>
                    <p className="text-[10px] text-gray-400 mt-1 font-mono">"{nextRank.title.toUpperCase()}"</p>
                  </div>
                </div>
                <div className="space-y-1.5 mt-2 text-[10px] font-mono text-gray-400">
                  <p>
                    <span className="text-orange-400 mr-1">DESBLOQUEA:</span>
                    {nextRank.unlocks}
                  </p>
                  <p>
                    <span className="text-gray-500 mr-1">REQUERIDO:</span>
                    <span className="text-white font-bold">{Math.ceil(xpNeededForNextRank)} XP</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </HudPanel>


        {/* ── RESUMEN 7 DÍAS ── */}
        <HudPanel title="RESUMEN_7_DÍAS" mod="WK-SUM" id="0002-W" dotStatus="active" className="w-full">
          <div className="grid grid-cols-3 gap-2">
            <Stat value={fmtMinutes(week.minutes)} label="Enfoque" />
            <Stat value={week.sessions} label="Sesiones" />
            <Stat value={`${week.activeDays}/7`} label="Días activos" />
          </div>
          <p className="mt-3 text-[11px] font-mono flex items-center gap-1.5">
            {diffMin > 0 ? (
              <><TrendingUp size={13} className="text-green-400" /><span className="text-green-400">+{fmtMinutes(diffMin)}</span><span className="text-gray-500">vs los 7 días anteriores</span></>
            ) : week.minutes === 0 && prevWeek.minutes === 0 ? (
              <span className="text-gray-500">// Un bloque de 10 minutos ya cuenta. Empieza cuando quieras.</span>
            ) : (
              <span className="text-gray-500">// 7 días anteriores: {fmtMinutes(prevWeek.minutes)} · cada bloque suma</span>
            )}
          </p>
        </HudPanel>

        {/* ── GRÁFICO DE ENFOQUE ── */}
        <HudPanel title="CRONOLOGÍA_DE_ENFOQUE" mod="CRN-F6" id="0003-C" dotStatus="active" className="w-full">
          <div className="flex bg-neutral-950 border border-orange-500/10 p-1 mb-3" style={{ clipPath: cut(6) }}>
            {[['daily', '24 h'], ['weekly', '7 días'], ['monthly', '30 días']].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="flex-1 py-1.5 text-xs font-bold uppercase transition-all"
                style={{
                  background: activeTab === id ? 'rgba(var(--accent-rgb),0.1)' : 'transparent',
                  border: activeTab === id ? '1px solid var(--accent)' : '1px solid transparent',
                  color: activeTab === id ? 'var(--accent)' : '#6b7280',
                  clipPath: cut(5),
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <BarChart key={activeTab} data={chartData} highlight={(d) => d.today || activeTab === 'daily'} />
          <div className="flex justify-between mt-3 font-mono text-[10px] uppercase text-gray-500">
            <span>Total: <span className="text-orange-400 font-bold">{fmtMinutes(chartTotal)}</span></span>
            {activeTab !== 'daily' && <span>Promedio día activo: <span className="text-orange-400 font-bold">{fmtMinutes(chartActive ? chartTotal / chartActive : 0)}</span></span>}
          </div>
        </HudPanel>

        {/* ── CONSTANCIA ── */}
        <HudPanel title="CONSTANCIA" mod="STK-R2" id="0004-S" dotStatus="active" className="w-full">
          <div className="grid grid-cols-3 gap-2">
            <Stat value={currentStreak} label="Racha actual" sub="días seguidos" />
            <Stat value={bestStreak} label="Mejor racha" sub="días seguidos" />
            <Stat value={monthDays} label="Este mes" sub="días activos" />
          </div>
          {currentStreak === 0 && history.length > 0 && (
            <p className="mt-3 text-[11px] font-mono text-gray-500">// La racha está en pausa. Un bloque hoy la reactiva.</p>
          )}
        </HudPanel>

        {/* ── TU RITMO ── */}
        <HudPanel title="TU_RITMO" mod="DGN-P3" id="0005-R" dotStatus="active" className="w-full">
          {history.length === 0 ? (
            <p className="text-gray-500 text-xs text-center font-mono py-6 uppercase tracking-widest">// Aparecerá cuando tengas sesiones</p>
          ) : (
            <>
              <p className="hud-label mb-1">// Minutos de foco según la hora en que empiezas</p>
              <BarChart
                height={80}
                data={byHour.map((v, h) => ({ title: `${hh(h)}–${hh(h + 1)}`, label: h % 6 === 0 ? String(h).padStart(2, '0') : '', value: v }))}
                highlight={(_, h) => window2h && h >= window2h.start && h < window2h.end}
              />
              <div className="grid grid-cols-2 gap-2 mt-4">
                <Stat value={window2h ? `${hh(window2h.start)}–${hh(window2h.end)}` : '—'} label="Ventana más productiva" />
                <Stat value={bestWeekday !== null ? WEEKDAYS_FULL[bestWeekday] : '—'} label="Mejor día" />
                <Stat value={fmtMinutes(avgSession)} label="Sesión promedio" />
                <Stat value={fmtMinutes(totalMin)} label="Total acumulado" />
              </div>
              {window2h && (
                <p className="mt-3 text-[11px] font-mono text-gray-400">
                  // Tip: agenda lo más difícil entre las <span className="text-orange-400">{hh(window2h.start)}</span> y las <span className="text-orange-400">{hh(window2h.end)}</span>.
                </p>
              )}
            </>
          )}
        </HudPanel>

        {/* ── MATRIZ DE ACTIVIDAD ── */}
        <HudPanel title="MATRIZ_DE_ACTIVIDAD" mod="MTR-C5" id="0006-M" dotStatus="active" className="w-full">
          <div className="h-5 mb-1 text-center font-mono text-[11px]">
            {cell ? (
              <span><span className="text-gray-500">{cell.date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}: </span>
                <span className="text-orange-400 font-bold">{cell.m ? fmtMinutes(cell.m) : 'sin sesiones'}</span></span>
            ) : <span className="text-gray-600">// últimas {WEEKS} semanas · toca un día</span>}
          </div>
          <div className="flex gap-1.5 justify-center">
            <div className="flex flex-col gap-[3px] pt-4">
              {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d, i) => (
                <span key={d} className="h-3 sm:h-3.5 text-[8px] font-mono text-gray-600 leading-3">{i % 2 === 0 ? d : ''}</span>
              ))}
            </div>
            {matrix.map((col, w) => {
              const first = col.find(Boolean)
              const showMonth = first && (w === 0 || first.date.getDate() <= 7)
              return (
                <div key={w} className="flex flex-col gap-[3px]">
                  <span className="h-3 text-[8px] font-mono text-gray-500 uppercase whitespace-nowrap">
                    {showMonth ? first.date.toLocaleDateString('es-ES', { month: 'short' }).slice(0, 3) : ''}
                  </span>
                  {col.map((day, d) => day ? (
                    <button key={d} onClick={() => setCell(cell?.key === day.key ? null : day)}
                      className="w-3 h-3 sm:w-3.5 sm:h-3.5"
                      style={{ ...levelStyle(day.level), outline: cell?.key === day.key ? '1px solid white' : 'none' }}
                      aria-label={day.key} />
                  ) : <div key={d} className="w-3 h-3 sm:w-3.5 sm:h-3.5" />)}
                </div>
              )
            })}
          </div>
          <div className="flex items-center justify-end gap-1 mt-3 font-mono text-[9px] text-gray-500">
            menos {[0, 1, 2, 3, 4].map(l => <span key={l} className="w-2.5 h-2.5 inline-block" style={levelStyle(l)} />)} más
          </div>
        </HudPanel>

        {/* ── PROYECTOS ── */}
        <HudPanel title="RENDIMIENTO_POR_PROYECTO" mod="PRJ-R7" id="0007-P" dotStatus="active" className="w-full">
          <div className="space-y-3.5 py-1">
            {perProject.length === 0 && <p className="text-gray-500 text-xs font-mono">// Sin proyectos</p>}
            {perProject.map(({ project, minutes, sessions }) => (
              <div key={project.id} className="flex items-center gap-3">
                <span className="text-xl p-1 bg-neutral-950 border border-orange-500/10" style={{ clipPath: cut(4) }}>{project.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1 font-mono text-[10px] uppercase gap-2">
                    <p className="font-bold text-gray-300 tracking-wide truncate">{project.name}</p>
                    <p className="text-gray-500 flex-shrink-0"><span className="font-bold text-orange-400">{fmtMinutes(minutes)}</span> · {sessions} ses · {totalMin ? Math.round((minutes / totalMin) * 100) : 0}%</p>
                  </div>
                  <div className="w-full bg-neutral-950 border border-orange-500/10 h-2" style={{ clipPath: cut(2) }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(minutes / maxProject) * 100}%` }} transition={{ duration: 0.6 }} className="bg-gradient-to-r from-orange-500 to-[var(--accent-2)] h-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </HudPanel>
      </div>
    </motion.div>
  )
}
