// ============= MUNDOS =============
// Cada proyecto vive en un mundo: paleta, atmósfera, verbos y arcos.
// El tema de toda la app cambia según el mundo del proyecto activo, y evoluciona
// con las horas acumuladas en ese proyecto (3 niveles, nunca se pierden).

export const LEVEL_THRESHOLDS = [0, 5, 15] // horas para nivel 1, 2 y 3

export const WORLDS = {
  saga: {
    id: 'saga', name: 'Saga', emoji: '🪓',
    tagline: 'Óxido, ámbar y sangre. Incursiones y sagas.',
    levels: [
      { name: 'Saga', accent: '#b9412b', accent2: '#7c2d12' },
      { name: 'Forjado', accent: '#e0622f', accent2: '#b45309' },
      { name: 'Leyenda', accent: '#e11d48', accent2: '#c0532e' },   // el rosa carmesí de Askeladd >5
    ],
    bg: '#0c0806',
    verbs: { sunrise: 'Zarpar', day: 'Forjar', duel: 'Asaltar', recharge: 'Reposar' },
    arcs: ['Salón de las Runas', 'Codex Askeladd', 'Linaje del Jarl', 'Jötunheimr', 'Avant', 'Ragnarök inminente', 'Camino del Wyrm', 'Last Challenge Helheim'],
    texture: 'embers',
  },
  dojo: {
    id: 'dojo', name: 'Dojo', emoji: '🖋️',
    tagline: 'Tinta y papel. Disciplina, uno contra uno mismo.',
    levels: [
      { name: 'Dojo', accent: '#d6d3d1', accent2: '#b91c1c' },
      { name: 'Templado', accent: '#f5f5f4', accent2: '#dc2626' },
      { name: 'Maestro', accent: '#dc2626', accent2: '#f5f5f4' },   // el sello rojo toma el control
    ],
    bg: '#0a0a0a',
    verbs: { sunrise: 'Despertar', day: 'Entrenar', duel: 'Batirse', recharge: 'Meditar' },
    arcs: ['Berserker Breakthrough', 'Solus', 'MODE-MONK', 'Awaken of Greatness', 'Programming Life', 'ISNOW'],
    texture: 'ink',
  },
  ascension: {
    id: 'ascension', name: 'Ascensión', emoji: '☀️',
    tagline: 'Oro y luz. Claridad, elevarse.',
    levels: [
      { name: 'Ascensión', accent: '#e8b33a', accent2: '#a16207' },
      { name: 'Radiante', accent: '#fcd34d', accent2: '#f59e0b' },
      { name: 'Cénit', accent: '#fef3c7', accent2: '#fcd34d' },     // luz casi blanca (FocusMode >5)
    ],
    bg: '#0b0905',
    verbs: { sunrise: 'Amanecer', day: 'Elevar', duel: 'Trascender', recharge: 'Respirar' },
    arcs: ['FocusMode I', 'InnerGlory', 'InnerGloryDAY', 'VERTEX', 'God', 'PRISM', 'EMERG', 'Elysium', 'RISE', 'DAWN'],
    texture: 'rays',
  },
  brasa: {
    id: 'brasa', name: 'Brasa', emoji: '🔥',
    tagline: 'Fuego en la oscuridad. El viaje largo.',
    levels: [
      { name: 'Brasa', accent: '#f97316', accent2: '#ef4444' },
      { name: 'Hoguera', accent: '#fb6a14', accent2: '#dc2626' },
      { name: 'Incendio', accent: '#ef4444', accent2: '#f97316' },
    ],
    bg: '#080808',
    verbs: { sunrise: 'Encender', day: 'Avanzar', duel: 'Embestir', recharge: 'Templar' },
    arcs: ['WayWarrior', 'IsPersonal', 'Pursuit to Mastery', 'Trono de Yggdrasil', 'Courses Challenge'],
    texture: 'embers',
  },
  indigo: {
    id: 'indigo', name: 'Índigo', emoji: '🌑',
    tagline: 'Frío, noche y máquina. Órbita y precisión.',
    levels: [
      { name: 'Índigo', accent: '#6d7ef5', accent2: '#3730a3' },
      { name: 'Órbita', accent: '#818cf8', accent2: '#6366f1' },
      { name: 'Eclipse', accent: '#a78bfa', accent2: '#6d7ef5' },
    ],
    bg: '#06070c',
    verbs: { sunrise: 'Despegar', day: 'Navegar', duel: 'Interceptar', recharge: 'Recalibrar' },
    arcs: ['NYX', 'Axis', 'PRIMUS', 'Aeon Disk'],
    texture: 'stars',
  },
  carmesi: {
    id: 'carmesi', name: 'Carmesí', emoji: '🌺',
    tagline: 'Carmesí y magenta. Crecer desbordándose.',
    levels: [
      { name: 'Carmesí', accent: '#e11d48', accent2: '#9f1239' },
      { name: 'Floración', accent: '#f43f5e', accent2: '#db2777' },
      { name: 'Rizoma', accent: '#d946ef', accent2: '#f43f5e' },
    ],
    bg: '#0c0609',
    verbs: { sunrise: 'Brotar', day: 'Expandir', duel: 'Desbordar', recharge: 'Fluir' },
    arcs: ['Rizoma', 'Fluctus', 'Daedalus Evolution'],
    texture: 'roots',
  },
}

export const WORLD_LIST = Object.values(WORLDS)
export const DEFAULT_WORLD = 'brasa'

export const worldOf = (project) => WORLDS[project?.world] || WORLDS[DEFAULT_WORLD]
export const arcOf = (project) => project?.arc || project?.name || ''

// Nivel (0, 1, 2) según horas acumuladas en el proyecto
export function levelFor(hours) {
  let lvl = 0
  LEVEL_THRESHOLDS.forEach((t, i) => { if (hours >= t) lvl = i })
  return lvl
}
export const projectHours = (projectId, history) =>
  history.filter(e => e.projectId === projectId).reduce((s, e) => s + (e.duration || 0), 0) / 3600

// Siguiente umbral: { level, name, hoursLeft } o null si ya está al máximo
export function nextLevelInfo(world, hours) {
  const lvl = levelFor(hours)
  if (lvl >= LEVEL_THRESHOLDS.length - 1) return null
  return { level: lvl + 1, name: world.levels[lvl + 1].name, hoursLeft: LEVEL_THRESHOLDS[lvl + 1] - hours }
}

// Paleta efectiva de un proyecto según su mundo y su nivel
export function themeFor(project, history) {
  const world = worldOf(project)
  const level = levelFor(projectHours(project?.id, history))
  return { world, level, levelName: world.levels[level].name, ...world.levels[level], bg: world.bg }
}

const hexToRgb = (hex) => {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16)
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`
}

// Variables CSS del tema (las clases orange-* de Tailwind se derivan de --accent en index.css)
export const themeVars = (theme) => ({
  '--accent': theme.accent,
  '--accent-rgb': hexToRgb(theme.accent),
  '--accent-2': theme.accent2,
  '--accent-2-rgb': hexToRgb(theme.accent2),
  '--bg': theme.bg,
  '--glow': theme.level === 0 ? '0.45' : theme.level === 1 ? '0.65' : '0.85',
})

// ── Títulos inmersivos: "Verbo || Arco" ──
// sunrise = primera sesión del día · duel = Chispa → Motor · recharge = mood bajo · day = el resto
export function sessionKind(entry, history) {
  if (entry.type === 'ignition') return 'duel'
  if (entry.mood === 'bajo') return 'recharge'
  const day = new Date(entry.date).toDateString()
  const firstOfDay = history
    .filter(e => new Date(e.date).toDateString() === day)
    .reduce((first, e) => (!first || new Date(e.date) < new Date(first.date) ? e : first), null)
  return firstOfDay && firstOfDay.id === entry.id ? 'sunrise' : 'day'
}

export function sessionTitle(entry, history, projects) {
  if (entry.type === 'roulette') return null
  const project = projects.find(p => p.id === entry.projectId)
  const world = WORLDS[entry.world] || worldOf(project)
  const arc = entry.arc || arcOf(project) || entry.projectName
  return `${world.verbs[sessionKind(entry, history)]} || ${arc}`
}
