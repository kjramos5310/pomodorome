// ============= GAMIFICACIÓN: RANGOS Y XP =============

export const RANKS = [
  { min: 1, max: 2, name: "ZERO", title: "Punto de origen", symbol: "○", kanji: "初", kanjiName: "HAJIME", color: "text-gray-500", unlocks: "Acceso básico", img: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMWo0amJleGE5c21kYXVtZnNyMWpwOXVsaHc2bW55aTN4MXhjdWZueCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/yMMJB4678mvyq3b4d2/giphy.gif" },
  { min: 3, max: 4, name: "PULSE", title: "Primer latido", symbol: "◐", kanji: "火", kanjiName: "HINOTE", color: "text-red-400", unlocks: "Glow sutil en logo", img: "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExbTRtMnlpYnM0cjJ6bzV6cjgwOTI1NjQ2Z3R3cHVjOXE1azg5aWc4NyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/wAPnwmm6pyJGkzMwkU/giphy.gif" },
  { min: 5, max: 7, name: "CIPHER", title: "Decodificador de caos", symbol: "◉", kanji: "影", kanjiName: "KAGE", color: "text-green-400", unlocks: "Partículas de matrix", img: "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExMWh6YnVhc3Q3MTRwdnplbXhjOG5paHpub2Z4d29tMmZ0aHlyZ253MCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/rbYnCejAAtZa8/giphy.gif" },
  { min: 8, max: 9, name: "PHANTOM", title: "Sombra entre datos", symbol: "◈", kanji: "幻", kanjiName: "MABOROSHI", color: "text-purple-400", unlocks: "Temas oscuros", img: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZTc2ZTlrZzZuc2oweTNnOXQwdTY4NjNxYWZmbWMyNHcxcXJiNDJyYSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/bHSkKRvkRvy5chUBBp/giphy.gif" },
  { min: 10, max: 14, name: "RONIN", title: "Guerrero sin cadenas", symbol: "◆", kanji: "浪", kanjiName: "RONIN", color: "text-orange-400", unlocks: "Avatares animados", img: "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3ZmNmNmNyd2szNnY3Y3pxbzMwOG13M205NDBiOW9qN2U0bDA4ZWo5YiZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/12R5vxt66fJbqwDZy0/giphy.gif" },
  { min: 15, max: 19, name: "SHOGUN", title: "Señor del foco", symbol: "❖", kanji: "将", kanjiName: "SHOGUN", color: "text-red-600", unlocks: "Dashboard katana", img: "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3N2h1dzY0Ym8yMnU1bmxnemU4Y2p3cDV2YThpOTNzbXN0bTd1cDRmYyZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/i7a6dFeZiIivlkz4YY/giphy.gif" },
  { min: 20, max: 29, name: "GENESIS", title: "Origen de disciplina", symbol: "✦", kanji: "創", kanjiName: "SOUZOU", color: "text-blue-400", unlocks: "Sonidos premium", img: "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3N2h1dzY0Ym8yMnU1bmxnemU4Y2p3cDV2YThpOTNzbXN0bTd1cDRmYyZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/0LmZlgyXgSY4zq3Dn1/giphy.gif" },
  { min: 30, max: 39, name: "VOID WALKER", title: "Caminante del abismo", symbol: "✧", kanji: "虚", kanjiName: "KYOMU", color: "text-indigo-400", unlocks: "Modo abismo", img: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZm1tM2ljaTR2cWI1cWJ1Ynhtendzd3o4aW9obzVud3F3N3oyZWZpdCZlcD12MV9naWZzX3RyZW5kaW5nJmN0PWc/WxDRpJffd7qsNXfAOz/giphy.gif" },
  { min: 40, max: 49, name: "OMEGA", title: "El inevitable", symbol: "⬡", kanji: "終", kanjiName: "OWARI", color: "text-yellow-400", unlocks: "Efectos dorados", img: "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzFleWZhcG5lYXRwMTVubnJoN2hoN2RyNWNxcW5tN2xqd2ttZ3d1eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3W3uOgHY1eM75Z6j0a/giphy.gif" },
  { min: 50, max: 74, name: "ETERNAL", title: "Conquistador del tiempo", symbol: "۞", kanji: "永", kanjiName: "EIEN", color: "text-emerald-400", unlocks: "Métricas eternas", img: "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3czlkejBrbmN5dGRqanl6eHFkbXZsaGRlYXF5ZG8zcTM1a21yNHR3aiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/YYCArzzkIiL54PcGsp/giphy.gif" },
  { min: 75, max: 99, name: "CELESTIAL", title: "Entre los astros", symbol: "✴", kanji: "神", kanjiName: "KAMI", color: "text-cyan-400", unlocks: "Ascensión cósmica", img: "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3czlkejBrbmN5dGRqanl6eHFkbXZsaGRlYXF5ZG8zcTM1a21yNHR3aiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/TAdayXZ1EB9kc/giphy.gif" },
  { min: 100, max: 9999, name: "ABSOLUTE", title: "Más allá del límite", symbol: "∞", kanji: "無", kanjiName: "MU", color: "text-white", unlocks: "Dominio absoluto", img: "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3ajFzN2o4aW05aG5oY2NudWx4eGFveXQyOHVlcGIyeDB3bDlxemwxNCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/Zr9qnDq9eUhC0T2NuF/giphy.gif" }
]

// Curva cuadrática: nivel 2 necesita 10 XP, nivel 3 necesita 40 XP (delta 30), nivel 4 necesita 90 XP (delta 50)
export const getLevel = (xp) => Math.floor(Math.sqrt(Math.max(0, xp) / 10)) + 1
export const getRank = (lvl) => RANKS.find(r => lvl >= r.min && lvl <= r.max) || RANKS[RANKS.length - 1]
export const getNextRank = (lvl) => RANKS.find(r => r.min > lvl) || null
export const getNextLevelXP = (lvl) => 10 * Math.pow(lvl, 2)

// Progreso (0-100) hacia el siguiente nivel
export const getProgressToNext = (xp, lvl) => {
  const next = getNextLevelXP(lvl)
  const prev = getNextLevelXP(lvl - 1)
  return Math.min(100, Math.max(0, ((xp - prev) / (next - prev)) * 100))
}

// ============= XP DERIVADA =============
// La XP NO se guarda por separado: siempre se calcula desde el historial y los
// proyectos. Así sumar, borrar o importar sesiones nunca la desincroniza.

export const SESSION_XP = 1          // por bloque de deepwork
export const ROULETTE_XP = 2         // por sesión de ruleta
export const PROJECT_DONE_XP = 5     // por proyecto marcado como terminado

// XP de una entrada del historial.
// Entradas antiguas sin xpGained: 1 XP si tienen deepworks o duraron más de 5 min.
export const xpOfEntry = (entry) =>
  entry.xpGained ?? ((entry.deepworksCompleted || entry.duration > 300) ? SESSION_XP : 0)

export const computeXP = (history, projects = []) =>
  history.reduce((acc, entry) => acc + xpOfEntry(entry), 0) +
  projects.filter(p => p.status === 'done').length * PROJECT_DONE_XP
