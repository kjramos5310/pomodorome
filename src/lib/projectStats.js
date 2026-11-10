// ============= ESTADÍSTICAS Y RUTA DE UN PROYECTO =============
// Funciones puras para la ficha de Proyectos (y la ruta que usan otros flujos).

const DAY = 86400000

// ── Ruta de pasos ──
export const routeSteps = (project) => project?.steps || []
export const nextPendingStep = (project) => routeSteps(project).find(s => !s.done) || null
export function routeProgress(project) {
  const steps = routeSteps(project)
  const done = steps.filter(s => s.done).length
  return { done, total: steps.length, next: steps.find(s => !s.done) || null }
}
export const newStepId = () => `st-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`

// ── Horas por semana (lunes a domingo), de la más antigua a la actual ──
export function weeklyMinutes(entries, weeks = 8, now = new Date()) {
  const monday = new Date(now)
  monday.setHours(0, 0, 0, 0)
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
  return Array.from({ length: weeks }, (_, i) => {
    const start = new Date(monday.getTime() - (weeks - 1 - i) * 7 * DAY)
    const end = new Date(start.getTime() + 7 * DAY)
    const minutes = entries
      .filter(e => { const t = new Date(e.date); return t >= start && t < end })
      .reduce((s, e) => s + (e.duration || 0) / 60, 0)
    return { start, minutes, current: i === weeks - 1 }
  })
}

// ── Ritmo vs plazo ──
// status: 'done' | 'no_deadline' | 'no_data' | 'on_track' | 'needs_push' | 'deadline_passed'
export function projectPace(project, entries, now = new Date()) {
  const goalH = project.hoursGoal || 0
  const doneH = entries.reduce((s, e) => s + (e.duration || 0), 0) / 3600
  const leftH = Math.max(0, goalH - doneH)
  const created = new Date(project.createdAt || now)
  const elapsedDays = Math.max(1, Math.ceil((now - created) / DAY))
  const deadline = project.plannedDays ? new Date(created.getTime() + project.plannedDays * DAY) : null
  const daysLeft = deadline ? Math.ceil((deadline - now) / DAY) : null

  // Ritmo reciente: promedio diario de los últimos 14 días (o desde que existe el proyecto)
  const windowDays = Math.min(14, elapsedDays)
  const since = new Date(now.getTime() - windowDays * DAY)
  const recentMin = entries.filter(e => new Date(e.date) >= since).reduce((s, e) => s + (e.duration || 0) / 60, 0)
  const recentMinPerDay = recentMin / windowDays

  const neededMinPerDay = daysLeft && daysLeft > 0 ? (leftH * 60) / daysLeft : null
  const projectedDate = leftH > 0 && recentMinPerDay > 0
    ? new Date(now.getTime() + Math.ceil((leftH * 60) / recentMinPerDay) * DAY)
    : null

  let status
  if (goalH && leftH === 0) status = 'done'
  else if (!deadline) status = 'no_deadline'
  else if (daysLeft <= 0) status = 'deadline_passed'
  else if (recentMinPerDay === 0) status = 'no_data'
  else status = projectedDate && projectedDate <= deadline ? 'on_track' : 'needs_push'

  return { goalH, doneH, leftH, elapsedDays, deadline, daysLeft, recentMinPerDay, neededMinPerDay, projectedDate, status }
}

// ── Preguntas abiertas del proyecto ──
// Aparcadas en Chispa → Motor y partes donde te trabaste en la síntesis.
export function openQuestions(entries) {
  const out = []
  entries.forEach(e => {
    if (e.type === 'ignition') (e.questions || []).filter(Boolean).forEach(q => out.push({ text: q, kind: 'aparcada', date: e.date }))
    ;(e.synthesis?.stuckOn || []).filter(Boolean).forEach(s => out.push({ text: s, kind: 'trabado', date: e.date }))
  })
  return out.sort((a, b) => new Date(b.date) - new Date(a.date))
}
