// ============= ESTADÍSTICAS DEL HISTORIAL =============
// Funciones puras usadas por Métricas y Calendario.
// Nota: entry.date es la hora en que TERMINÓ la sesión; el inicio es date - duration.

import { getLocalYMD } from './dates'

const DAY = 86400000
export const minutesOf = (e) => (e.duration || 0) / 60
export const startOf = (e) => new Date(new Date(e.date).getTime() - (e.duration || 0) * 1000)

// { 'YYYY-MM-DD': minutos }
export function minutesByDay(history) {
  const map = {}
  history.forEach(e => {
    const d = getLocalYMD(e.date)
    map[d] = (map[d] || 0) + minutesOf(e)
  })
  return map
}

// Lista de los últimos n días (YYYY-MM-DD), del más antiguo a hoy
export function lastDays(n, now = new Date()) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now); d.setDate(d.getDate() - (n - 1 - i))
    return getLocalYMD(d)
  })
}

// Resumen de un rango de días: minutos, sesiones y días activos
function summarize(history, days) {
  const set = new Set(days)
  const entries = history.filter(e => set.has(getLocalYMD(e.date)))
  return {
    minutes: entries.reduce((s, e) => s + minutesOf(e), 0),
    sessions: entries.length,
    activeDays: new Set(entries.map(e => getLocalYMD(e.date))).size,
  }
}

// Últimos 7 días vs los 7 anteriores
export function weekComparison(history, now = new Date()) {
  const days14 = lastDays(14, now)
  return {
    current: summarize(history, days14.slice(7)),
    previous: summarize(history, days14.slice(0, 7)),
  }
}

// Racha actual (cuenta si hubo actividad hoy o ayer) y mejor racha
export function streaks(history, now = new Date()) {
  if (history.length === 0) return { current: 0, best: 0 }
  const dates = [...new Set(history.map(e => getLocalYMD(e.date)))].sort((a, b) => b.localeCompare(a))
  const diffDays = (a, b) => Math.round((new Date(a + 'T12:00') - new Date(b + 'T12:00')) / DAY)
  const today = getLocalYMD(now)
  let current = 0
  if (diffDays(today, dates[0]) <= 1) {
    current = 1
    for (let i = 1; i < dates.length; i++) {
      if (diffDays(dates[i - 1], dates[i]) === 1) current++; else break
    }
  }
  let best = 1, run = 1
  for (let i = 1; i < dates.length; i++) {
    if (diffDays(dates[i - 1], dates[i]) === 1) { run++; best = Math.max(best, run) } else run = 1
  }
  return { current, best: Math.max(best, current) }
}

// Días con actividad en el mes en curso (no se reinicia por fallar un día)
export function activeDaysThisMonth(history, now = new Date()) {
  const prefix = getLocalYMD(now).slice(0, 7)
  return new Set(history.map(e => getLocalYMD(e.date)).filter(d => d.startsWith(prefix))).size
}

// Minutos de foco por hora del día en que EMPEZÓ la sesión (0-23)
export function minutesByHour(history) {
  const arr = Array(24).fill(0)
  history.forEach(e => { arr[startOf(e).getHours()] += minutesOf(e) })
  return arr
}

// Mejor ventana de `width` horas consecutivas → { start, end, minutes } o null
export function bestWindow(byHour, width = 2) {
  let best = null
  for (let h = 0; h <= 24 - width; h++) {
    const m = byHour.slice(h, h + width).reduce((a, b) => a + b, 0)
    if (m > 0 && (!best || m > best.minutes)) best = { start: h, end: h + width, minutes: m }
  }
  return best
}

// Promedio de minutos por día de la semana, contando solo días activos (0=Dom)
export function avgByWeekday(history) {
  const byDay = minutesByDay(history)
  const sum = Array(7).fill(0), count = Array(7).fill(0)
  Object.entries(byDay).forEach(([d, m]) => {
    const wd = new Date(d + 'T12:00').getDay()
    sum[wd] += m; count[wd]++
  })
  return sum.map((s, i) => (count[i] ? s / count[i] : 0))
}

// Horas por proyecto desde el historial → [{ project, minutes, sessions }]
export function minutesByProject(history, projects) {
  const map = {}
  history.forEach(e => {
    map[e.projectId] = map[e.projectId] || { minutes: 0, sessions: 0 }
    map[e.projectId].minutes += minutesOf(e)
    map[e.projectId].sessions++
  })
  return projects
    .map(p => ({ project: p, ...(map[p.id] || { minutes: 0, sessions: 0 }) }))
    .sort((a, b) => b.minutes - a.minutes)
}

// Formato corto: 95 → "1h 35m", 40 → "40m"
export function fmtMinutes(min) {
  const m = Math.round(min)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60), r = m % 60
  return r ? `${h}h ${r}m` : `${h}h`
}
