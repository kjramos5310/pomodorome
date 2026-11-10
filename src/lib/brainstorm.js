// ============= LLUVIA DE IDEAS =============
// Junta en un solo lugar todo lo que fue quedando suelto en las sesiones:
// preguntas, preguntas aparcadas, partes donde te trabaste y el inbox de distracciones.

export const IDEA_KINDS = {
  pregunta: { label: 'Pregunta', color: '#f97316' },
  aparcada: { label: 'Aparcada', color: '#facc15' },
  trabado: { label: 'Trabado', color: '#f87171' },
  inbox: { label: 'Inbox', color: '#60a5fa' },
  nota: { label: 'Nota', color: '#4ade80' },
}

// Textos genéricos que no aportan como idea
const GENERIC = new Set(['enfocarse en la tarea'])

// Distracciones de ciclos antiguos de Chispa → Motor (solo quedaron en el texto de notas)
function legacyDistractions(notes) {
  const line = (notes || '').split('\n').find(l => l.startsWith('🧠 Distracciones anotadas:'))
  return line ? line.replace('🧠 Distracciones anotadas:', '').split('·').map(s => s.trim()).filter(Boolean) : []
}

/**
 * @returns [{ id, text, kind, projectId, projectName, projectEmoji, date, origin }]
 * Los ids son estables (derivados de la sesión), así se pueden ocultar o mover.
 */
export function collectIdeas(history, manualNotes = []) {
  const ideas = []
  history.forEach(e => {
    const base = {
      projectId: e.projectId, projectName: e.projectName, projectEmoji: e.projectEmoji,
      date: e.date, origin: e.sessionObjective || (e.type === 'roulette' ? 'Ruleta' : ''),
    }
    const push = (kind, text, i) => {
      const t = (text || '').trim()
      if (!t || GENERIC.has(t.toLowerCase())) return
      ideas.push({ ...base, id: `${e.id}-${kind}-${i}`, text: t, kind })
    }
    if (e.type === 'ignition') (e.questions || []).forEach((q, i) => push('aparcada', q, i))
    else (e.questions || []).forEach((q, i) => push('pregunta', q, i))
    ;(e.synthesis?.stuckOn || []).forEach((s, i) => push('trabado', s, i))
    const inbox = [...(e.inbox || []), ...(e.distractions || [])]
    ;(inbox.length ? inbox : legacyDistractions(e.notes)).forEach((d, i) => push('inbox', d, i))
  })
  manualNotes.forEach(n => ideas.push({ ...n, kind: 'nota' }))
  return ideas.sort((a, b) => new Date(b.date) - new Date(a.date))
}

// Hash estable de un texto → número, para dispersar cada nota siempre igual
export function hashOf(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) }
  return Math.abs(h)
}
