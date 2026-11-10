// ============= IMPORTAR BACKUP =============
// Función pura: recibe el estado actual y el JSON importado, y devuelve el
// estado fusionado. No toca React ni localStorage, así que es fácil de testear.

// Normaliza el JSON importado a { history, projects } aceptando formatos legacy
const normalize = (importedData) => {
  // Formato actual { history, projects }
  if (importedData.history && importedData.projects) {
    return { history: importedData.history, projects: importedData.projects }
  }
  // Legacy: array directo de history
  if (Array.isArray(importedData)) {
    return { history: importedData, projects: [] }
  }
  // Legacy: objeto único
  return { history: [importedData], projects: [] }
}

/**
 * @returns null si el archivo no trae datos válidos; si no
 *   { history, projects, newEntriesCount, newProjectsCount }
 */
export function mergeBackup(currentHistory, currentProjects, importedData) {
  const imported = normalize(importedData)

  // Filtrar entradas de historial inválidas
  const validHistory = imported.history.filter(entry => entry.id && entry.date && entry.projectId)

  if (validHistory.length === 0 && imported.projects.length === 0) return null

  // 1. Fusionar historial evitando duplicados (ids pueden ser number o string)
  const existingIds = new Set(currentHistory.map(e => String(e.id)))
  const newEntries = validHistory.filter(e => !existingIds.has(String(e.id)))
  const history = [...newEntries, ...currentHistory].sort((a, b) => new Date(b.date) - new Date(a.date))

  // 2. Fusionar proyectos (prioridad al local salvo que el importado tenga más deepworks)
  const projectMap = new Map(currentProjects.map(p => [p.id, p]))
  let newProjectsCount = 0

  // A. Proyectos explícitos del backup
  imported.projects.forEach(p => {
    if (!projectMap.has(p.id)) {
      projectMap.set(p.id, p)
      newProjectsCount++
    } else {
      const existing = projectMap.get(p.id)
      if (p.totalDeepworks > existing.totalDeepworks) {
        projectMap.set(p.id, { ...existing, ...p })
      }
    }
  })

  // B. Recrear proyectos faltantes desde el historial (si no vinieron en projects)
  validHistory.forEach(entry => {
    if (!projectMap.has(entry.projectId)) {
      projectMap.set(entry.projectId, {
        id: entry.projectId,
        name: entry.projectName || 'Proyecto Restaurado',
        emoji: entry.projectEmoji || '📁',
        focus: entry.projectFocus || '',
        createdAt: entry.date,
        totalDeepworks: 1,
        status: 'in_progress',
        plannedDays: 7,
        hoursGoal: 10,
        hoursLogged: entry.duration ? entry.duration / 3600 : 0
      })
      newProjectsCount++
    }
  })

  return {
    history,
    projects: Array.from(projectMap.values()),
    newEntriesCount: newEntries.length,
    newProjectsCount,
  }
}
