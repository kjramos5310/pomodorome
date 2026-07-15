import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlayCircle, Plus, Check, Download, Sparkles, Menu, X, Folder, History, BarChart3, ChevronDown, Trash2, CalendarDays } from 'lucide-react'
import { useAppData } from './hooks/useAppData'
import { useLocalStorage } from './hooks/useLocalStorage'
import './index.css'

// ============= DATE HELPERS =============
const getLocalYMD = (date) => {
  const d = date ? new Date(date) : new Date()
  const offset = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - offset).toISOString().split('T')[0]
}
const getLocalYMDH = (date) => {
  const d = date ? new Date(date) : new Date()
  const offset = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - offset).toISOString().substring(0, 13)
}

// ============= MAIN APP COMPONENT =============
function App() {
  // Cargar configuración desde JSON externo
  const { data: config, loading: configLoading, error: configError } = useAppData()

  // Estado global de la aplicación - DeepWork Flow
  const [screen, setScreen] = useState('hero')
  const [mood, setMood] = useState(null)
  const [deepworkCount, setDeepworkCount] = useState(1)
  const [currentDeepwork, setCurrentDeepwork] = useState(1)
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [completedQuestions, setCompletedQuestions] = useState([])
  const [logs, setLogs] = useState([])

  const [synthesisData, setSynthesisData] = useState({})
  const [evidenceData, setEvidenceData] = useState({})
  const [sessionObjective, setSessionObjective] = useState('')
  const [learningPhase, setLearningPhase] = useState(null) // 'captura' | 'proceso' | 'output'

  // Estado - Proyectos y Navegación (persistido en localStorage)
  // GAMIFICATION CONFIG
  const RANKS = [
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

  // Helpers de XP
  // Quadratic: Level 2 needs 10 XP, Level 3 needs 40 XP (delta 30), Level 4 needs 90 XP (delta 50)
  const getLevel = (xp) => Math.floor(Math.sqrt(Math.max(0, xp) / 10)) + 1
  const getRank = (lvl) => RANKS.find(r => lvl >= r.min && lvl <= r.max) || RANKS[RANKS.length - 1]
  const getNextRank = (lvl) => RANKS.find(r => r.min > lvl) || null
  const getNextLevelXP = (currLvl) => 10 * Math.pow(currLvl, 2)

  const [history, setHistory] = useLocalStorage('deepwork_history', [])
  const [projects, setProjects] = useLocalStorage('deepwork_projects', [])
  const [currentProject, setCurrentProject] = useLocalStorage('dw_current_project', null)
  const [sessionData, setSessionData] = useLocalStorage('deepwork_session', {
    startTime: null,
    duration: 0,
    isActive: false,
    isPaused: false
  })
  const [dailyGoal, setDailyGoal] = useLocalStorage('deepwork_daily_goal', 4) // Meta diaria flexible (default 4h para TDAH)

  // Calcular XP inicial basado en historial si no existe
  const calculateInitialXP = () => {
    // 1 XP por sesión (según feedback usuario)
    // Si no hay deepworksCompleted, asumimos 1 si duración > 5 min
    const totalSessions = history.reduce((acc, entry) => acc + (entry.deepworksCompleted || (entry.duration > 300 ? 1 : 0)), 0)
    return totalSessions
  }

  const [xp, setXP] = useLocalStorage('deepwork_xp', calculateInitialXP()) // Inicializar con historial retroactivo

  const currentLevel = getLevel(xp)
  const currentRank = getRank(currentLevel)
  const nextLevelXP = 10 * Math.pow(currentLevel, 2)
  const prevLevelXP = 10 * Math.pow(currentLevel - 1, 2)
  const progressToNext = Math.min(100, Math.max(0, ((xp - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100))

  // Inicializar proyectos desde config.json solo si localStorage está vacío
  useEffect(() => {
    if (config && projects.length === 0) {
      setProjects(config.initialProjects)
      setCurrentProject(config.initialProjects[0])
    }
  }, [config, projects, setCurrentProject, setProjects]) // Added dependencies for useEffect
  const [showSidebar, setShowSidebar] = useState(false)
  const [navigationScreen, setNavigationScreen] = useState(null) // 'projects', 'history', 'metrics', null
  const [showProjectSelector, setShowProjectSelector] = useState(false)

  const [showLevelUp, setShowLevelUp] = useState(false)
  const [lastLevel, setLastLevel] = useLocalStorage('deepwork_last_level', 1)

  // Detectar Level Up
  useEffect(() => {
    if (currentLevel > lastLevel) {
      setShowLevelUp(true)
      // Confetti or sound could be triggered here
      setLastLevel(currentLevel)
    }
  }, [currentLevel, lastLevel, setLastLevel])
  const addLog = (eventType, data) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event_type: eventType,
      data: data
    }
    setLogs(prev => [...prev, logEntry])
    console.log('Log added:', logEntry)
  }

  // Exportar logs
  const exportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `deepwork-logs-${new Date().toISOString().split('T')[0]}.json`
    link.click()
  }

  // Manejar enrutamiento desde PWA Shortcuts (Query params)
  useEffect(() => {
    if (!config) return
    
    const params = new URLSearchParams(window.location.search)
    const screenParam = params.get('screen')
    const startParam = params.get('start')

    if (screenParam) {
      if (['projects', 'history', 'metrics'].includes(screenParam)) {
        setNavigationScreen(screenParam)
      }
    } else if (startParam === 'true') {
      // Salta directo al focus con defaults (Inicio Rápido)
      const quickMood = mood || 'neutro'
      setMood(quickMood)
      setDeepworkCount(1)
      setQuestions(['Enfocarse en la tarea'])
      setCurrentQuestionIndex(0)
      setCompletedQuestions([])
      
      const moodConf = config?.moodConfigs?.[quickMood]
      if (moodConf) {
        moodConf.focusTime = 25 * 60
      }
      addLog('quick_start', { timestamp: new Date().toISOString() })
      setScreen('focus')
    }
    
    // Limpiar los query params del navegador para evitar bucles en F5
    if (screenParam || startParam) {
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [config])

  // Importar logs
  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result)

        let newHistory = []
        let newProjects = []

        // Soporte para nuevo formato { history, projects }
        if (importedData.history && importedData.projects) {
          newHistory = importedData.history
          newProjects = importedData.projects
        }
        // Soporte legacy (array directo de history)
        else if (Array.isArray(importedData)) {
          newHistory = importedData
        }
        else {
          // Soporte legacy (objeto único)
          newHistory = [importedData]
        }

        // Filtrar entradas de historial inválidas
        const validHistory = newHistory.filter(entry => entry.id && entry.date && entry.projectId)

        if (validHistory.length === 0 && newProjects.length === 0) {
          alert('No se encontraron datos válidos en el archivo.')
          return
        }

        // 1. Fusionar historial evitando duplicados
        let newEntriesCount = 0
        setHistory(prev => {
          const existingIds = new Set(prev.map(e => e.id))
          const newEntries = validHistory.filter(e => !existingIds.has(e.id))
          newEntriesCount = newEntries.length
          const combined = [...newEntries, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date))
          
          // Re-calcular XP total basado en el historial combinado
          const totalSessions = combined.reduce((acc, entry) => acc + (entry.deepworksCompleted || (entry.duration > 300 ? 1 : 0)), 0)
          setXP(totalSessions)
          
          return combined
        })

        // 2. Fusionar proyectos (prioridad a los importados si son más recientes o si no existen)
        let newProjectsCount = 0
        setProjects(prevProjects => {
          // Crear mapa de proyectos existentes
          const projectMap = new Map(prevProjects.map(p => [p.id, p]))

          // A. Agregar proyectos explícitos del backup
          newProjects.forEach(p => {
            if (!projectMap.has(p.id)) {
              projectMap.set(p.id, p)
              newProjectsCount++
            } else {
              // Si existe, podríamos fusionar stats. Por ahora, priorizamos el local salvo que el importado tenga más deepworks
              const existing = projectMap.get(p.id)
              if (p.totalDeepworks > existing.totalDeepworks) {
                projectMap.set(p.id, { ...existing, ...p })
              }
            }
          })

          // B. Recrear proyectos faltantes desde el historial (si no vinieron en projects)
          validHistory.forEach(entry => {
            if (!projectMap.has(entry.projectId)) {
              const newProject = {
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
              }
              projectMap.set(entry.projectId, newProject)
              newProjectsCount++
            }
          })

          return Array.from(projectMap.values())
        })

        alert(`Importación completada:\n- ${newEntriesCount} sesiones añadidas\n- ${newProjectsCount} proyectos sincronizados`)
      } catch (err) {
        console.error('Error importando:', err)
        alert('Error al leer el archivo JSON')
      }
    }
    reader.readAsText(file)
  }

  // Guardar sesión completada al historial
  const saveToHistory = () => {
    // Calcular XP: 1 XP por sesión completada + Bonus por proyecto (TODO)
    const xpGained = 1
    setXP(prev => prev + xpGained)

    const historyEntry = {
      id: Date.now().toString(),
      projectId: currentProject.id,
      projectName: currentProject.name,
      projectEmoji: currentProject.emoji,
      projectFocus: currentProject.focus,
      date: new Date().toISOString(),
      mood: mood,
      deepworksCompleted: currentDeepwork,
      deepworksPlanned: deepworkCount,
      duration: sessionData.duration || 0,
      xpGained: xpGained,
      questions: questions,
      synthesis: synthesisData,
      evidence: evidenceData,
      sessionObjective: sessionObjective,
      learningPhase: learningPhase,
    }
    setHistory(prev => [historyEntry, ...prev])

    // Actualizar total de deepworks del proyecto
    setProjects(prev => prev.map(p =>
      p.id === currentProject.id
        ? { ...p, totalDeepworks: p.totalDeepworks + 1 }
        : p
    ))
  }

  // Eliminar entrada del historial
  const handleDeleteHistoryEntry = (entryId) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta sesión? Se restará el progreso del proyecto y de la experiencia (XP).")) {
      return
    }

    setHistory(prevHistory => {
      const entryToDelete = prevHistory.find(e => e.id === entryId);
      if (!entryToDelete) return prevHistory;

      // Restar Deepworks del Proyecto
      setProjects(prevProjects => prevProjects.map(p => {
        if (p.id === entryToDelete.projectId) {
          return {
            ...p,
            totalDeepworks: Math.max(0, p.totalDeepworks - (entryToDelete.deepworksCompleted || 1))
          }
        }
        return p;
      }));

      // Restar XP global
      const xpToSubtract = entryToDelete.xpGained || entryToDelete.deepworksCompleted || 1;
      setXP(prevXp => Math.max(0, prevXp - xpToSubtract));

      // Retornar nuevo historial filtrando el eliminado
      return prevHistory.filter(e => e.id !== entryId);
    });
  }

  // Configuraciones desde config.json (con fallback por si no cargó)
  const moodConfigs = config?.moodConfigs ?? {
    bajo: { suggested: 1, warmupTime: 120, focusTime: 900 },
    neutro: { suggested: 2, warmupTime: 120, focusTime: 1500 },
    ready: { suggested: 3, warmupTime: 120, focusTime: 1500 },
    flow: { suggested: 5, warmupTime: 120, focusTime: 2700 }
  }

  // Determinar si mostramos el header
  const isInDeepworkFlow = screen !== 'hero' && !navigationScreen
  const showHeader = navigationScreen || screen === 'hero'

  // Pantalla de carga mientras se obtiene config.json
  if (configLoading || !currentProject) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-neutral-950">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-2 border-gold-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (configError) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-neutral-950 px-8">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-2">Error al cargar configuración</p>
          <p className="text-gray-500 text-sm">{configError}</p>
          <p className="text-gray-600 text-xs mt-4">Verifica que existe /public/data/config.json</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full overflow-hidden bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      {/* Header - Solo en pantallas de navegación */}
      {showHeader && (
        <Header
          currentProject={currentProject}
          projects={projects}
          showProjectSelector={showProjectSelector}
          setShowProjectSelector={setShowProjectSelector}
          setCurrentProject={setCurrentProject}
          onMenuClick={() => setShowSidebar(true)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        show={showSidebar}
        onClose={() => setShowSidebar(false)}
        onNavigate={(screen) => {
          setNavigationScreen(screen)
          setShowSidebar(false)
        }}
        currentScreen={navigationScreen}
      />
      {/* Main Content */}
      <AnimatePresence mode="wait">
        {/* Navigation Screens */}
        {navigationScreen === 'projects' && (
          <ProjectsScreen
            key="projects"
            projects={projects}
            currentProject={currentProject}
            history={history}
            onSelectProject={(project) => {
              setCurrentProject(project)
              setNavigationScreen(null)
            }}
            onAddProject={(project) => {
              setProjects(prev => [...prev, project])
            }}
            onDeleteProject={(projectId) => {
              setProjects(prev => prev.filter(p => p.id !== projectId))
              if (currentProject.id === projectId && projects.length > 1) {
                setCurrentProject(projects.find(p => p.id !== projectId))
              }
            }}
            onUpdateProject={(updatedProject) => {
              setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p))

              if (currentProject && currentProject.id === updatedProject.id) {
                setCurrentProject(updatedProject)
              }

              // 5 XP Bonus handling (Prevent farming)
              if (updatedProject.status === 'done') {
                const oldProject = projects.find(p => p.id === updatedProject.id)
                if (oldProject && oldProject.status !== 'done') {
                  setXP(prev => prev + 5)
                  addLog('project_complete', { project: updatedProject.name, xp: 5 })
                  alert(`✨ ¡Proyecto Completado! Has ganado +5 XP`)
                }
              } else {
                // Si se quita el estado 'done', restar la XP ganada (para evitar farming)
                const oldProject = projects.find(p => p.id === updatedProject.id)
                if (oldProject && oldProject.status === 'done') {
                  setXP(prev => Math.max(0, prev - 5))
                  alert(`Se ha revertido la XP del proyecto (-5 XP)`)
                }
              }
            }}
          />
        )}

        {navigationScreen === 'history' && (
          <HistoryScreen
            key="history"
            history={history}
            projects={projects}
            onImport={handleImport}
            onDeleteEntry={handleDeleteHistoryEntry}
          />
        )}

        {navigationScreen === 'metrics' && (
          <MetricsScreen
            key="metrics"
            history={history}
            projects={projects}
            currentRank={currentRank}
            currentLevel={currentLevel}
            xp={xp}
            nextLevelXP={nextLevelXP}
            progressToNext={progressToNext}
            getNextRank={getNextRank}
          />
        )}

        {navigationScreen === 'calendar' && (
          <CalendarScreen
            key="calendar"
            history={history}
            projects={projects}
          />
        )}

        {/* DeepWork Flow Screens */}
        {!navigationScreen && (
          <>
            {screen === 'hero' && (
              <HeroScreen
                key="hero"
                currentRank={currentRank}
                currentLevel={currentLevel}
                progressToNext={progressToNext}
                history={history}
                dailyGoal={dailyGoal}
                onSetDailyGoal={setDailyGoal}
                onStart={() => {
                  setScreen('mood')
                  addLog('session_start', { timestamp: new Date().toISOString() })
                }}
                onQuickStart={() => {
                  // Inicio rápido: salta directo al focus con defaults
                  const quickMood = mood || 'neutro'
                  setMood(quickMood)
                  setDeepworkCount(1)
                  setQuestions(['Enfocarse en la tarea'])
                  setCurrentQuestionIndex(0)
                  setCompletedQuestions([])
                  moodConfigs[quickMood].focusTime = 25 * 60
                  addLog('quick_start', { timestamp: new Date().toISOString() })
                  setScreen('focus')
                }}
              />
            )}

            {screen === 'mood' && (
              <MoodScreen
                key="mood"
                moods={config?.moods}
                onSelectMood={(selectedMood) => {
                  setMood(selectedMood)
                  setDeepworkCount(moodConfigs[selectedMood].suggested)
                  addLog('mood_set', { mood: selectedMood })
                  setScreen('warmup')
                }}
              />
            )}

            {screen === 'warmup' && (
              <WarmUpScreen
                key="warmup"
                mood={mood}
                currentDeepwork={currentDeepwork}
                totalDeepworks={deepworkCount}
                duration={moodConfigs[mood].warmupTime}
                onComplete={() => {
                  addLog('warmup_complete', {
                    duration_seconds: moodConfigs[mood].warmupTime,
                    deepwork_number: currentDeepwork
                  })
                  // First block → define objective + config. Subsequent → straight to questions
                  setScreen(sessionObjective ? 'questions' : 'objective')
                }}
              />
            )}

            {screen === 'objective' && (
              <ObjectiveScreen
                key="objective"
                projectName={currentProject?.name}
                onConfirm={(obj, phase) => {
                  setSessionObjective(obj)
                  setLearningPhase(phase)
                  setScreen('config')
                }}
              />
            )}

            {screen === 'config' && (
              <DeepworkConfigScreen
                key="config"
                mood={mood}
                suggestedCount={moodConfigs[mood].suggested}
                moodColors={config?.moodColors}
                countOptions={config?.deepworkCountOptions}
                onStart={(count, duration) => {
                  setDeepworkCount(count)
                  // Sobrescribimos la duración sugerida por el mood
                  moodConfigs[mood].focusTime = duration * 60
                  setScreen('questions')
                }}
              />
            )}

            {screen === 'questions' && (
              <QuestionsScreen
                key="questions"
                onStart={(questionsList) => {
                  setQuestions(questionsList)
                  setCurrentQuestionIndex(0)
                  setCompletedQuestions([])
                  setScreen('focus')
                }}
              />
            )}

            {screen === 'focus' && (
              <FocusScreen
                key="focus"
                mood={mood}
                duration={moodConfigs[mood].focusTime}
                questions={questions}
                currentQuestionIndex={currentQuestionIndex}
                completedQuestions={completedQuestions}
                onAddQuestion={(newQuestion) => {
                  setQuestions(prev => [...prev, newQuestion])
                }}
                onCompleteQuestion={() => {
                  setCompletedQuestions(prev => [...prev, currentQuestionIndex])
                  if (currentQuestionIndex < questions.length - 1) {
                    setCurrentQuestionIndex(prev => prev + 1)
                  }
                }}
                onComplete={(sessionInfo) => {
                  addLog('focus_complete', {
                    questions_answered: completedQuestions.length,
                    duration: moodConfigs[mood].focusTime
                  })
                  setSessionData(sessionInfo)
                  setScreen('synthesis')
                }}
              />
            )}

            {screen === 'break' && (
              <BreakScreen
                key="break"
                duration={5 * 60} // 5 minutos de descanso por defecto
                onComplete={() => {
                  addLog('break_complete', { duration_seconds: 5 * 60 })
                  setScreen('warmup')
                }}
              />
            )}

            {screen === 'synthesis' && (
              <SynthesisScreen
                key="synthesis"
                onNext={(data) => {
                  setSynthesisData(data)
                  setScreen('evidence')
                }}
              />
            )}

            {screen === 'evidence' && (
              <EvidenceScreen
                key="evidence"
                onNext={(data) => {
                  setEvidenceData(data)
                  addLog('evidence_added', {
                    type: data.type,
                    content_preview: data.content?.substring(0, 50)
                  })
                  saveToHistory() // Guardar al historial
                  setScreen('completed')
                }}
              />
            )}

            {screen === 'completed' && (
              <CompletedScreen
                key="completed"
                history={history}
                currentDeepwork={currentDeepwork}
                totalDeepworks={deepworkCount}
                sessionData={sessionData}
                logs={logs}
                onNextDeepwork={() => {
                  setCompletedQuestions([])
                  setQuestions([])
                  setSynthesisData({})
                  setEvidenceData({})
                  setLogs([])
                  setSessionData({ startTime: null, duration: 0, isActive: false, isPaused: false })
                  setCurrentDeepwork(prev => prev + 1)
                  setScreen('break')
                }}
                onAddExtraDeepwork={() => {
                  setCompletedQuestions([])
                  setQuestions([])
                  setSynthesisData({})
                  setEvidenceData({})
                  setLogs([])
                  setSessionData({ startTime: null, duration: 0, isActive: false, isPaused: false })
                  setDeepworkCount(prev => prev + 1)
                  setCurrentDeepwork(prev => prev + 1)
                  setScreen('break')
                }}
                onFinishDay={() => {
                  // Reset all flow state
                  setCompletedQuestions([])
                  setQuestions([])
                  setSynthesisData({})
                  setEvidenceData({})
                  setLogs([])
                  setSessionData({ startTime: null, duration: 0, isActive: false, isPaused: false })
                  setSessionObjective('')
                  setLearningPhase(null)
                  setScreen('hero')
                  setNavigationScreen('metrics')
                  setCurrentDeepwork(1)
                  setMood(null)
                }}
                onExportLogs={exportLogs}
              />
            )}
            {showLevelUp && (
              <LevelUpModal
                level={currentLevel}
                rank={currentRank}
                onClose={() => setShowLevelUp(false)}
              />
            )}
          </>
        )}
      </AnimatePresence>
    </div >
  )
}

// 0. LEVEL UP MODAL
function LevelUpModal({ level, rank, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.5, y: 50 }}
        className="bg-neutral-900 border border-gold-500/30 p-8 rounded-3xl max-w-sm w-full text-center relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent opacity-50" />

        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-6xl mb-4"
        >
          🎉
        </motion.div>

        <h2 className="text-3xl font-bold text-white mb-2">¡NIVEL {level}!</h2>
        <p className="text-gold-400 font-medium mb-6">Has ascendido a {rank.name}</p>

        {/* Level Up GIF */}
        <div className="w-48 h-48 mx-auto rounded-full overflow-hidden mb-6 border-4 border-gold-500 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
          <img
            src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHlpeGJ2MmEyamJodXh5ZHZhZzlvMWFmbDRpYXM1MjMyZjl1YzhwayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3nyIj1d1igD4SGhVvu/giphy.gif"
            alt="Level Up"
            className="w-full h-full object-cover"
          />
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-gold-500 hover:bg-gold-600 text-black font-bold rounded-xl transition-colors"
        >
          ¡VAMOS!
        </button>
      </motion.div>
    </motion.div>
  )
}

// 0.5 PARTICLES BACKGROUND
function ParticlesBackground({ colorClass }) {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    // Generate 80 random particles (Double the amount)
    const newParticles = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 10 + 6, // 6px to 16px (Bigger)
      delay: Math.random() * 3, // Less delay
      duration: Math.random() * 8 + 10 // 10s to 18s (Faster)
    }))
    setParticles(newParticles)
  }, [])

  // Mapeo manual para evitar que Tailwind purgue las clases generadas dinámicamente
  const bgMap = {
    'text-gray-500': 'bg-gray-500 shadow-gray-500',
    'text-red-400': 'bg-red-400 shadow-red-400',
    'text-green-400': 'bg-green-400 shadow-green-400',
    'text-purple-400': 'bg-purple-400 shadow-purple-400',
    'text-orange-400': 'bg-orange-400 shadow-orange-400',
    'text-red-600': 'bg-red-600 shadow-red-600',
    'text-blue-400': 'bg-blue-400 shadow-blue-400',
    'text-indigo-400': 'bg-indigo-400 shadow-indigo-400',
    'text-yellow-400': 'bg-yellow-400 shadow-yellow-400',
    'text-emerald-400': 'bg-emerald-400 shadow-emerald-400',
    'text-cyan-400': 'bg-cyan-400 shadow-cyan-400',
    'text-white': 'bg-white shadow-white'
  }

  const particleClass = bgMap[colorClass] || 'bg-gold-500 shadow-gold-500'

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className={`absolute rounded-full shadow-[0_0_20px_rgba(255,255,255,0.6)] ${particleClass}`}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [-20, -1000],
            x: [0, (Math.random() - 0.5) * 150],
            opacity: [0, 1, 0], // Higher opacity
            scale: [0.5, 2, 0.5] // More dramatic pulsing
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeIn" // Accelerates as they go up
          }}
        />
      ))}
    </div>
  )
}

// ─── HUD PANEL COMPONENT ───────────────────────────────────────────────────
function HudPanel({ title, mod, id, dotStatus = 'standby', children, className = '', stripeColor = '' }) {
  return (
    <div className={`hud-panel rounded-none ${className}`} style={{ fontFamily: "'Rajdhani', sans-serif" }}>
      <div className="hud-stripe" style={stripeColor ? { background: stripeColor } : {}} />
      <div className="px-3 pt-2 pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span style={{ color: '#f97316', fontSize: 11 }}>△</span>
            <span className="hud-title text-white text-xs">{title}</span>
            <span className="hud-label text-[9px]">[{mod}]</span>
          </div>
          <span className={`hud-dot ${dotStatus}`} />
        </div>
        {children}
        <div className="mt-2 hud-id">MN_SRK: {id}</div>
      </div>
    </div>
  )
}

// ─── SEGMENTED BAR ──────────────────────────────────────────────────────────
function SegBar({ total = 12, filled = 0 }) {
  return (
    <div className="hud-seg-bar">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`hud-seg ${i < filled ? 'on' : ''}`} />
      ))}
    </div>
  )
}

// ─── 1. HERO SCREEN ─────────────────────────────────────────────────────────
function HeroScreen({ onStart, onQuickStart, currentRank, currentLevel, progressToNext, history, dailyGoal, onSetDailyGoal }) {
  const [now, setNow] = useState(new Date())
  const [editingGoal, setEditingGoal] = useState(false)
  const [goalInput, setGoalInput] = useState(String(dailyGoal))
  const [activeMobileTab, setActiveMobileTab] = useState('timer') // 'timer' | 'pilot' | 'stats'

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(t)
  }, [])

  // ── Today stats ────────────────────────────────────────────────────────────
  const todayStr = getLocalYMD()
  const todayEntries = (history || []).filter(e => getLocalYMD(e.date) === todayStr)
  const todaySeconds = todayEntries.reduce((s, e) => s + (e.duration || 0), 0)
  const todayHours = todaySeconds / 3600
  const pct = Math.min(todayHours / dailyGoal, 1)
  const done = pct >= 1

  // ── Week stats ─────────────────────────────────────────────────────────────
  const weekAgo = Date.now() - 7 * 24 * 3600 * 1000
  const weekEntries = (history || []).filter(e => new Date(e.date).getTime() >= weekAgo)
  const weekSessions = weekEntries.length
  const weekHours = +(weekEntries.reduce((s, e) => s + (e.duration || 0), 0) / 3600).toFixed(1)

  // ── Level segments ─────────────────────────────────────────────────────────
  const levelSegs = 12
  const filledSegs = Math.round((progressToNext / 100) * levelSegs)

  // ── Status ─────────────────────────────────────────────────────────────────
  const statusLabel = done ? 'COMPLETADO' : todayEntries.length > 0 ? 'ACUMULANDO' : 'INACTIVO'
  const statusDot = done ? 'active' : todayEntries.length > 0 ? 'standby' : 'idle'

  // Update ring dimensions
  const R = 140
  const CIRC = 2 * Math.PI * R
  const ringDash = pct * CIRC

  // ── Remaining ──────────────────────────────────────────────────────────────
  const remSec = Math.max(0, dailyGoal * 3600 - todaySeconds)
  const remH = Math.floor(remSec / 3600)
  const remM = Math.floor((remSec % 3600) / 60)

  const handleGoalSave = () => {
    const val = parseFloat(goalInput)
    if (!isNaN(val) && val > 0 && val <= 24) onSetDailyGoal(val)
    setEditingGoal(false)
  }

  // ── Days of week ───────────────────────────────────────────────────────────
  const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
  const todayDow = (new Date().getDay() + 6) % 7 // 0=Mon

  // Recent sessions (last 4 for the panel)
  const recentSessions = [...(history || [])].slice(0, 4)

  // ── Racha / Streak calculation (extracted from MetricsScreen) ──────────────────
  const calcStreak = () => {
    if (!history || history.length === 0) return { current: 0, best: 0 }
    const dates = [...new Set(history.map(e => getLocalYMD(e.date)))].sort((a, b) => b.localeCompare(a))
    const today = getLocalYMD()
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
    const yStr = getLocalYMD(yesterday)
    let current = 0
    if (dates[0] === today || dates[0] === yStr) {
      current = 1
      for (let i = 1; i < dates.length; i++) {
        const diff = (new Date(dates[i - 1]) - new Date(dates[i])) / 86400000
        if (diff === 1) current++; else break
      }
    }
    let best = 0, streak = 1
    for (let i = 1; i < dates.length; i++) {
      const diff = (new Date(dates[i - 1]) - new Date(dates[i])) / 86400000
      if (diff === 1) streak++; else { best = Math.max(best, streak); streak = 1 }
    }
    return { current, best: Math.max(best, streak, current) }
  }
  const { current: currentStreak } = calcStreak()

  // Get active days of current week
  const activeDaysThisWeek = days.map((_, i) => {
    const currentWeekStart = new Date()
    const currentDay = currentWeekStart.getDay() // 0=Sun, 1=Mon, ..., 6=Sat
    const daysSinceMon = currentDay === 0 ? 6 : currentDay - 1
    currentWeekStart.setDate(currentWeekStart.getDate() - daysSinceMon + i)
    const ymd = getLocalYMD(currentWeekStart)
    return (history || []).some(e => getLocalYMD(e.date) === ymd)
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full relative overflow-hidden pt-[68px]"
      style={{ background: '#080808', fontFamily: "'Rajdhani', sans-serif", height: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      {/* Scanline overlay */}
      <div className="hud-scanline" />

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(249,115,22,0.05) 0%, transparent 70%)'
      }} />

      {/* ── TOP HEADER BAR ──────────────────────────────────────────────── */}
      <div className="hidden lg:flex items-center justify-between px-4 h-[40px] shrink-0 border-b border-orange-500/10"
        style={{ background: 'rgba(249,115,22,0.03)' }}>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded" style={{
            background: 'linear-gradient(135deg, #f97316, #ef4444)',
            boxShadow: '0 0 10px rgba(249,115,22,0.5)'
          }} />
          <span className="hud-title text-white text-xs tracking-widest">DEEPWORK</span>
        </div>
        <span className="hud-label text-[9px]" style={{ color: 'rgba(249,115,22,0.5)', letterSpacing: '0.2em' }}>
          DEEPWORK // OVERDRIVE_FRAME
        </span>
      </div>

      {/* ── MOBILE HUD TAB SELECTOR ───────────────────────────────────── */}
      <div className="flex lg:hidden items-center justify-around border-b border-orange-500/10 px-4 h-[44px] shrink-0"
        style={{ background: 'rgba(249,115,22,0.02)' }}>
        <button
          onClick={() => setActiveMobileTab('pilot')}
          className={`flex-1 h-full font-bold text-xs tracking-wider transition-all border-b-2 ${
            activeMobileTab === 'pilot'
              ? 'border-orange-500 text-orange-500 font-extrabold text-shadow-[0_0_8px_#f97316]'
              : 'border-transparent text-gray-500'
          }`}
          style={{ fontFamily: "'Rajdhani', sans-serif" }}
        >
          // PILOTO
        </button>
        <button
          onClick={() => setActiveMobileTab('timer')}
          className={`flex-1 h-full font-bold text-xs tracking-wider transition-all border-b-2 ${
            activeMobileTab === 'timer'
              ? 'border-orange-500 text-orange-500 font-extrabold text-shadow-[0_0_8px_#f97316]'
              : 'border-transparent text-gray-500'
          }`}
          style={{ fontFamily: "'Rajdhani', sans-serif" }}
        >
          // ENFOQUE
        </button>
        <button
          onClick={() => setActiveMobileTab('stats')}
          className={`flex-1 h-full font-bold text-xs tracking-wider transition-all border-b-2 ${
            activeMobileTab === 'stats'
              ? 'border-orange-500 text-orange-500 font-extrabold text-shadow-[0_0_8px_#f97316]'
              : 'border-transparent text-gray-500'
          }`}
          style={{ fontFamily: "'Rajdhani', sans-serif" }}
        >
          // REPORTES
        </button>
      </div>

      {/* ── MAIN GRID ───────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── ODYSSEY LEFT PANEL (image 3 style) ──────────────────────── */}
        <div className={`relative shrink-0 border-orange-500/15 h-full overflow-hidden ${
          activeMobileTab === 'pilot' ? 'flex w-full justify-center border-b border-orange-500/10' : 'hidden lg:flex lg:border-r'
        }`}
          style={{ width: activeMobileTab === 'pilot' ? '100%' : 200, background: '#090909' }}>
          <div className="relative w-[200px] h-full shrink-0">

          {/* Hazard stripe top */}
          <div className="hud-stripe absolute top-0 left-0 right-0" style={{ zIndex: 2 }} />

          {/* OD-01 identifier */}
          <div className="absolute top-5 right-3 z-10">
            <span className="hud-label" style={{ fontSize: 9, color: 'rgba(249,115,22,0.5)' }}>OD-01</span>
          </div>

          {/* Left edge: vertical level progress bar */}
          <div className="absolute left-0 top-8 bottom-8 flex flex-col items-center" style={{ width: 8 }}>
            <div style={{
              flex: 1,
              width: 3,
              background: 'rgba(249,115,22,0.08)',
              position: 'relative',
              borderRadius: 2
            }}>
              <div style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0,
                height: `${progressToNext}%`,
                background: 'linear-gradient(to top, #f97316, #ef4444)',
                borderRadius: 2,
                boxShadow: '0 0 6px rgba(249,115,22,0.6)'
              }} />
            </div>
          </div>

          {/* BIG vertical ODYSSEY text */}
          <div className="absolute left-3 top-0 bottom-0 flex items-center" style={{ zIndex: 1 }}>
            <span style={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              transform: 'rotate(180deg)',
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 900,
              fontSize: 48,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              background: 'linear-gradient(to top, rgba(249,115,22,0.9), rgba(239,68,68,0.95))',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              filter: 'drop-shadow(0 0 12px rgba(249,115,22,0.5))',
              lineHeight: 1,
              userSelect: 'none'
            }}>
              {(currentRank.name || 'ODYSSEY').toUpperCase()}
            </span>
          </div>

          {/* Diagnostic connecting lines overlay */}
          <svg className="absolute pointer-events-none" style={{ left: 55, top: 40, width: 120, height: 180, zIndex: 0 }}>
            {/* Line from top area (near OD-01) to logo */}
            <path d="M 90 5 L 90 22 L 50 22 L 50 35" fill="none" stroke="rgba(249,115,22,0.3)" strokeWidth="1" />
            <circle cx="90" cy="5" r="2" fill="#f97316" />
            {/* Line from logo to TECH_DATA */}
            <path d="M 50 100 L 50 115 L 10 115" fill="none" stroke="rgba(249,115,22,0.3)" strokeWidth="1" />
            <circle cx="10" cy="115" r="2" fill="#f97316" />
          </svg>

          {/* Right content: avatar outline + tech data */}
          <div className="absolute right-0 top-12 bottom-16 flex flex-col justify-start items-center" style={{ left: 55, padding: '4px' }}>

            {/* Gray/White Oni Mask Outline Logo (matches Image 3 style, no duplicate red GIF) */}
            <div className="mb-4 flex flex-col items-center justify-center" style={{ width: 100, height: 100, relative: 'true' }}>
              <svg width="68" height="68" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-gray-500 opacity-80">
                {/* Outermost dash polygon */}
                <path d="M 50 12 L 22 35 L 22 65 L 50 88 L 78 65 L 78 35 Z" strokeWidth="1" strokeDasharray="3 3" />
                {/* Main Oni face frame */}
                <path d="M 50 18 L 28 37 L 28 63 L 50 82 L 72 63 L 72 37 Z" />
                {/* Horns */}
                <path d="M 28 37 L 13 18 L 22 20 Z" fill="currentColor" opacity="0.8" />
                <path d="M 72 37 L 87 18 L 78 20 Z" fill="currentColor" opacity="0.8" />
                {/* Eyes */}
                <path d="M 36 48 L 45 52" strokeWidth="3" />
                <path d="M 64 48 L 55 52" strokeWidth="3" />
                {/* Eyebrows */}
                <path d="M 32 44 L 46 47" strokeWidth="2" strokeLinecap="round" />
                <path d="M 68 44 L 54 47" strokeWidth="2" strokeLinecap="round" />
                {/* Nose outline */}
                <path d="M 50 50 L 45 61 L 55 61 Z" fill="currentColor" opacity="0.6" />
                {/* Teeth and mouth */}
                <path d="M 35 67 L 40 62 L 45 67 L 50 62 L 55 67 L 60 62 L 65 67" />
                <path d="M 33 71 L 67 71 L 50 80 Z" strokeWidth="1.5" />
              </svg>
              <p className="hud-label text-center mt-2" style={{ fontSize: 8, color: 'rgba(249,115,22,0.45)', whiteSpace: 'nowrap' }}>
                Odyssey #1 || Prog. Life
              </p>
            </div>

            {/* TECH_DATA */}
            <div className="w-full pl-2">
              <p style={{ color: '#f97316', fontFamily: "'Share Tech Mono',monospace", fontSize: 10, marginBottom: 4 }}>
                ● TECH_DATA
              </p>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: '#4b5563', lineHeight: 1.6 }}>
                <p>PILOT: <span style={{ color: '#888' }}>[YISUS]</span></p>
                <p>FRAME: <span style={{ color: '#888' }}>DW_CORE</span></p>
                <p>DEPLOYED: <span style={{ color: '#888' }}>{(history || []).length} SES.</span></p>
                <p>TOTAL_OP: <span style={{ color: '#888' }}>{weekHours}H</span></p>
                <p>STATUS: <span style={{ color: statusDot === 'active' ? '#22c55e' : '#f97316' }}>{statusLabel}</span></p>
              </div>
            </div>
          </div>

          {/* PROGRAMMING_LIFE vertical - right edge */}
          <div className="absolute right-1 top-0 bottom-0 flex items-center" style={{ zIndex: 1 }}>
            <span style={{
              writingMode: 'vertical-rl',
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 9,
              letterSpacing: '0.2em',
              color: '#1a1a1a',
              textTransform: 'uppercase'
            }}>PROGRAMMING_LIFE</span>
          </div>

          {/* Bottom status in panel */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-orange-500/10 px-3 py-1.5">
            <div className="flex items-center gap-2">
              <span className={`hud-dot ${statusDot}`} style={{ width: 6, height: 6 }} />
              <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: '#4b5563', letterSpacing: '0.15em' }}>
                {statusLabel}
              </span>
            </div>
          </div>
          </div>
        </div>

        {/* ── CENTER AREA (Locked to 100vh height, responsive scaling) ── */}
        <div className={`flex-1 flex-col items-center justify-between py-3 px-6 h-full overflow-hidden ${
          activeMobileTab === 'timer' ? 'flex w-full' : 'hidden lg:flex'
        }`} style={{ minWidth: 0 }}>

          {/* Large ring + avatar ── Responsive size */}
          <div className="relative flex items-center justify-center my-auto"
            style={{
              width: 'clamp(280px, 52vh, 400px)',
              height: 'clamp(280px, 52vh, 400px)'
            }}>

            <svg viewBox="0 0 340 340" className="absolute inset-0 w-full h-full"
              style={{ filter: 'drop-shadow(0 0 4px rgba(249,115,22,0.2))' }}>
              {/* Outer glow ring */}
              <circle cx="170" cy="170" r="155" fill="none" stroke="rgba(249,115,22,0.03)" strokeWidth="20" />
              {/* Track */}
              <circle cx="170" cy="170" r="140" fill="none" stroke="rgba(249,115,22,0.08)" strokeWidth="14" />
              {/* 48 tick marks */}
              {Array.from({ length: 48 }).map((_, i) => {
                const angle = (i / 48) * 360 - 90
                const rad = angle * Math.PI / 180
                const isMajor = i % 6 === 0
                const r1 = 140 - (isMajor ? 10 : 6)
                const r2 = 140 + (isMajor ? 4 : 2)
                return (
                  <line
                    key={i}
                    x1={170 + r1 * Math.cos(rad)} y1={170 + r1 * Math.sin(rad)}
                    x2={170 + r2 * Math.cos(rad)} y2={170 + r2 * Math.sin(rad)}
                    stroke={isMajor ? 'rgba(249,115,22,0.25)' : 'rgba(249,115,22,0.1)'}
                    strokeWidth={isMajor ? 1.5 : 0.8}
                  />
                )
              })}
              {/* Progress arc */}
              <motion.circle
                cx="170" cy="170" r={R}
                fill="none" stroke="#f97316" strokeWidth="12" strokeLinecap="butt"
                strokeDasharray={`${ringDash} ${CIRC}`}
                strokeDashoffset={0}
                transform="rotate(-90 170 170)"
                initial={{ strokeDasharray: `0 ${CIRC}` }}
                animate={{ strokeDasharray: `${ringDash} ${CIRC}` }}
                transition={{ duration: 1.6, ease: 'easeOut' }}
                style={{ filter: 'drop-shadow(0 0 8px rgba(249,115,22,0.9)) drop-shadow(0 0 20px rgba(249,115,22,0.4))' }}
              />
              {/* Inner decorative ring */}
              <circle cx="170" cy="170" r="122" fill="none" stroke="rgba(249,115,22,0.05)" strokeWidth="1" />
              <circle cx="170" cy="170" r="115" fill="none" stroke="rgba(249,115,22,0.03)" strokeWidth="1" />
            </svg>

            {/* Avatar button */}
            <motion.button
              onClick={onStart}
              className="relative rounded-full overflow-hidden cursor-pointer z-10"
              style={{
                width: 'clamp(180px, 34vh, 260px)',
                height: 'clamp(180px, 34vh, 260px)'
              }}
              animate={{ scale: [1, 1.012, 1] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
            >
              <img
                src="https://i.pinimg.com/originals/57/52/1e/57521e44486b536872c9416c465e9079.gif"
                alt="Iniciar sesión"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 rounded-full"
                style={{ boxShadow: 'inset 0 0 40px rgba(249,115,22,0.25), inset 0 0 80px rgba(0,0,0,0.4)' }} />
              <div className="absolute inset-0 rounded-full"
                style={{ border: '2px solid rgba(249,115,22,0.5)', boxShadow: '0 0 20px rgba(249,115,22,0.3)' }} />
            </motion.button>
          </div>

          {/* Controls section - tightly stacked to save height */}
          <div className="flex flex-col items-center gap-1.5 w-full mt-auto">

            {/* Status */}
            <div className="flex items-center gap-2">
              <span className="hud-label" style={{ fontSize: 10, letterSpacing: '0.3em', color: 'rgba(249,115,22,0.5)' }}>// STATUS:</span>
              <span className={`hud-dot ${statusDot}`} />
              <span className="hud-title animate-pulse" style={{ fontSize: 14, letterSpacing: '0.22em', color: '#f97316' }}>{statusLabel}</span>
            </div>

            {/* Hours / goal */}
            <div className="flex items-baseline gap-1.5">
              <span className="hud-number" style={{ fontSize: 32 }}>{todayHours.toFixed(1)}</span>
              {editingGoal ? (
                <div className="flex items-center gap-1">
                  <span className="hud-label text-xs">/</span>
                  <input
                    type="number" min="0.5" max="24" step="0.5"
                    value={goalInput}
                    onChange={e => setGoalInput(e.target.value)}
                    onBlur={handleGoalSave}
                    onKeyDown={e => e.key === 'Enter' && handleGoalSave()}
                    autoFocus
                    className="w-12 text-center font-bold bg-neutral-900 border border-orange-500/40 text-orange-400 focus:outline-none px-1"
                    style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12 }}
                  />
                  <span className="hud-label text-xs">H</span>
                </div>
              ) : (
                <button
                  onClick={() => { setGoalInput(String(dailyGoal)); setEditingGoal(true) }}
                  className="flex items-center gap-1 group hover:text-orange-400 transition-colors"
                >
                  <span className="hud-label text-xs">/ {dailyGoal}H</span>
                  <span className="group-hover:opacity-60 opacity-0 transition-opacity text-orange-500" style={{ fontSize: 9 }}>✏</span>
                </button>
              )}
            </div>

            {/* Level seg bar */}
            <div style={{ width: '100%', maxWidth: 340 }} className="mb-0.5">
              <div className="flex items-center justify-between mb-0.5">
                <span className="hud-label text-[9px]">{`>> NIVEL_${currentLevel.toString().padStart(2, '0')} — ${currentRank.kanji} ${currentRank.name}`}</span>
                <span className="hud-label text-[9px]">{Math.round(progressToNext)}%</span>
              </div>
              <SegBar total={14} filled={Math.round((progressToNext / 100) * 14)} />
            </div>

            {!done && (
              <p className="hud-label mb-2" style={{ fontSize: 9, color: 'rgba(249,115,22,0.6)' }}>
                {remH > 0 ? `${remH}H ${remM}M RESTANTES` : `${remM}M RESTANTES`}
              </p>
            )}

            {/* ── MAIN CTA BUTTON ──── angular HUD style */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={onStart}
              className="mb-2 hud-glow-orange"
              style={{
                width: '100%',
                maxWidth: 340,
                background: 'rgba(249,115,22,0.06)',
                border: '1px solid rgba(249,115,22,0.5)',
                clipPath: 'polygon(10px 0%, calc(100% - 10px) 0%, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0% calc(100% - 10px), 0% 10px)',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer'
              }}
            >
              <div className="hud-stripe" style={{ height: 3 }} />
              <div style={{
                padding: '10px 20px',
                fontFamily: "'Rajdhani', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: '0.18em',
                color: '#f97316',
                textAlign: 'center'
              }}>
                &gt;&gt; ¿POR QUÉ HAGO ESTO?
              </div>
            </motion.button>

            {/* ── QUICK START BUTTON ── kanji style from image 2 */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={onQuickStart}
              style={{
                width: '100%',
                maxWidth: 340,
                background: 'rgba(0,0,0,0.85)',
                border: '1px solid rgba(249,115,22,0.35)',
                clipPath: 'polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px)',
                overflow: 'hidden',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'stretch'
              }}
            >
              {/* Kanji box — 起動 means "launch/start" */}
              <div style={{
                background: 'rgba(249,115,22,0.15)',
                borderRight: '1px solid rgba(249,115,22,0.3)',
                padding: '8px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontFamily: 'serif', fontSize: 20, color: '#f97316', lineHeight: 1, textShadow: '0 0 10px rgba(249,115,22,0.6)' }}>起動</span>
              </div>
              {/* Text */}
              <div style={{
                flex: 1,
                padding: '8px 14px',
                display: 'flex',
                alignItems: 'center',
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 11,
                letterSpacing: '0.1em',
                color: 'rgba(249,115,22,0.7)'
              }}>
                // INICIO RÁPIDO — 25 MIN
              </div>
            </motion.button>
          </div>
        </div>

        {/* ── RIGHT PANELS (Scrollable sidebar on small screen heights) ── */}
        <div className={`flex-col gap-2 p-2 shrink-0 h-full overflow-y-auto ${
          activeMobileTab === 'stats' ? 'flex w-full items-center px-4 py-4' : 'hidden lg:flex'
        }`} style={{ width: activeMobileTab === 'stats' ? '100%' : 'clamp(200px, 22vw, 250px)' }}>
          <div className="w-full max-w-[340px] flex flex-col gap-3">

          {/* RACHA_DIARIA [MOD-01] (Matches mockup image 1 layout) */}
          <HudPanel title="RACHA_DIARIA" mod="MOD-01" id="0004-4-99" dotStatus={currentStreak > 0 ? 'active' : 'standby'}>
            <p className="hud-label text-[9px] mb-0.5">RACHA ACTUAL</p>
            <p className="hud-number" style={{ fontSize: 26, lineHeight: 1.1 }}>
              {currentStreak}<span style={{ fontSize: 12, opacity: 0.6, marginLeft: 2 }}>DÍAS</span>
            </p>
            <p className="hud-label text-[9px] mt-1 mb-2.5" style={{ color: 'rgba(249,115,22,0.5)' }}>
              {currentStreak > 0 ? `▲ +${currentStreak} días vs sem. anterior` : '○ SIN ACTIVIDAD REGISTRADA'}
            </p>
            
            {/* L M X J V S D week flames (Matches mockup design) */}
            <div className="flex gap-1 justify-between px-1">
              {days.map((d, i) => (
                <div key={d} className="flex flex-col items-center gap-1">
                  <span className="hud-label" style={{ fontSize: 8, color: i === todayDow ? '#f97316' : '#4b5563', fontWeight: i === todayDow ? 700 : 400 }}>{d}</span>
                  {activeDaysThisWeek[i] ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" className="filter drop-shadow-[0_0_4px_#f97316]">
                      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3.5z" fill="#f97316"/>
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1f2937" strokeWidth="2">
                      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3.5z"/>
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </HudPanel>


          <HudPanel title="HECHO_ESTA_SEM" mod="MOD-02" id="0048-4-02" dotStatus="standby">
            <div className="space-y-1">
              {recentSessions.length === 0 ? (
                <p className="hud-label text-[9px]">Sin sesiones aún</p>
              ) : (
                recentSessions.map((s, i) => (
                  <div key={s.id || i} className="flex items-center gap-1.5">
                    <span style={{ color: '#f97316', fontSize: 8 }}>▶</span>
                    <span className="hud-label text-[9px] truncate" style={{ color: '#6b7280', maxWidth: 120 }}>
                      {s.projectEmoji} {s.projectName || 'Sesión'} — {Math.round((s.duration || 0) / 60)}m
                    </span>
                  </div>
                ))
              )}
            </div>
          </HudPanel>

          <HudPanel title="STATS_SEMANA" mod="MOD-03" id="0048-4-03" dotStatus={weekSessions > 0 ? 'active' : 'idle'}>
            <div className="space-y-2">
              <div>
                <p className="hud-label text-[9px] mb-0.5">Sesiones</p>
                <p className="hud-number" style={{ fontSize: 20 }}>{weekSessions}</p>
              </div>
              <div>
                <p className="hud-label text-[9px] mb-0.5">Horas totales</p>
                <p className="hud-number" style={{ fontSize: 20 }}>{weekHours}<span style={{ fontSize: 10 }}>H</span></p>
              </div>
              <div>
                <p className="hud-label text-[9px] mb-1">Distribución</p>
                <div className="flex gap-0.5 items-end" style={{ height: 24 }}>
                  {[10, 11, 12, 15, 16, 17, 21, 22].map((h, i) => {
                    const h2 = getLocalYMDH(new Date(new Date().setHours(h, 0, 0, 0)))
                    const count = (history || []).filter(e => getLocalYMDH(e.date) === h2).length
                    const barH = Math.max(4, Math.min(24, count * 8 + 4))
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center justify-end">
                        <div style={{ height: barH, background: count > 0 ? '#f97316' : 'rgba(249,115,22,0.1)', width: '100%' }} />
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </HudPanel>

          <HudPanel title="RANGO" mod="MOD-04" id="0048-4-04" dotStatus={done ? 'active' : 'idle'}>
            <div className="flex items-center gap-2 mb-1">
              <span style={{ fontSize: 24, lineHeight: 1 }}>{currentRank.symbol}</span>
              <div>
                <p className="hud-title text-white text-xs">{currentRank.name}</p>
                <p className="hud-label text-[9px]">{currentRank.kanjiName}</p>
              </div>
            </div>
            <p className="hud-label text-[9px] mb-1" style={{ color: '#4b5563' }}>{currentRank.title}</p>
            <SegBar total={10} filled={Math.round((progressToNext / 100) * 10)} />
          </HudPanel>
          </div>
        </div>
      </div>

      {/* ── BOTTOM STATUS BAR ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 h-[30px] shrink-0 border-t border-orange-500/10"
        style={{ background: 'rgba(0,0,0,0.7)', fontFamily: "'Share Tech Mono', monospace" }}>
        <div className="flex gap-4">
          {[
            { label: 'INACTIVO', active: statusLabel === 'INACTIVO' },
            { label: 'EN CURSO', active: false },
            { label: 'ACUMULANDO', active: statusLabel === 'ACUMULANDO', bold: true },
            { label: 'ALTA CARGA', active: pct >= 0.8 },
          ].map(s => (
            <span key={s.label} className="text-[9px] tracking-widest"
              style={{ color: s.active ? '#f97316' : '#374151', fontWeight: s.active && s.bold ? 700 : 400 }}>
              {s.label}
            </span>
          ))}
        </div>
        <div className="flex gap-3 items-center">
          <span className="text-[9px]" style={{ color: '#374151' }}>
            SYSTEM_TIME: {now.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <span className="text-[9px]" style={{ color: '#374151' }}>STATE: {statusLabel}</span>
          <span style={{ fontSize: 9, color: 'rgba(249,115,22,0.4)' }}>Optimizado para TDAH ✦</span>
        </div>
      </div>
    </motion.div>
  )
}


// 2. MOOD SCREEN
function MoodScreen({ onSelectMood, moods }) {
  const [selected, setSelected] = useState(null)

  // Fallback si no llegan props
  const moodList = moods ?? [
    { id: 'bajo', emoji: '😴', label: 'Bajo' },
    { id: 'neutro', emoji: '😐', label: 'Neutro' },
    { id: 'ready', emoji: '🔥', label: 'Ready' },
    { id: 'flow', emoji: '🌀', label: 'Flow' },
  ]

  const handleSelect = (moodId) => {
    setSelected(moodId)
    setTimeout(() => {
      onSelectMood(moodId)
    }, 300)
  }

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '-100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 px-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl font-semibold mb-4">¿Cómo estás hoy?</h2>
        <p className="text-gray-400 text-sm">Sé honesto, no hay respuesta incorrecta</p>
      </motion.div>

      <div className="flex gap-6 flex-wrap justify-center max-w-2xl">
        {moodList.map((mood, index) => (
          <motion.button
            key={mood.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: selected && selected !== mood.id ? 0.4 : 1,
              scale: selected === mood.id ? 1.15 : 1
            }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: selected ? 1 : 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelect(mood.id)}
            className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-neutral-850/50 backdrop-blur-sm hover:bg-neutral-850 transition-colors min-w-[140px]"
          >
            <span className="text-6xl">{mood.emoji}</span>
            <span className="text-white font-medium">{mood.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

// 3. DEEPWORK CONFIG SCREEN
function DeepworkConfigScreen({ mood, suggestedCount, onStart, moodColors, countOptions }) {
  const [count, setCount] = useState(suggestedCount)
  const [duration, setDuration] = useState(25) // 25 min default

  const options = countOptions ?? [1, 2, 3, 4, 5, 6]
  const durationOptions = [15, 25, 45, 60]

  // 🎞️ Pon aquí tus links de GIFs para cada número de deepworks
  const gifsByCount = {
    1: 'https://i.pinimg.com/originals/b3/0a/b3/b30ab33eb2d57ca6cfe93059c830fc58.gif', // reemplaza con tu link
    2: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExZGd6MTN2enQ1dGlvNG9nZHBxazI5cGhmMzNlZG02cXhhbmh3djNnNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/hP9gy6aTMyle7e5pbS/giphy.gif',
    3: 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExNm45ODN2a2ZxdDRoaGE4NmUxM2w4OTh1cnQ3dzNvazczNWkzNGE2MCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/2vkmQBB91NUTolPSd2/giphy.gif',
    4: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXg3a2kyMmg1NjZsM3ByZjlsbmlzajZsdmszaWZrbWhhZWNvZ2hiayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/K91OXsr6lSjh5qxQBb/giphy.gif',
    5: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExaWM3NXQ4aHlzZHJxcmFvcGR5bWY3cHozdWNnMnJsb25sOXMzeWNhcSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/KqOmIBTRF7RHwvGJqA/giphy.gif',
    6: 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExMWgwcWJmaXJsOXNybzN4cGJuZWpqZmhyaTc0eXp5bnhjbXUxZWRmOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/RDen1HUlEWp6OKS15E/giphy.gif',
  }

  const currentGif = gifsByCount[count] || gifsByCount[1]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 px-8"
    >
      {/* GIF */}
      <motion.div
        key={count}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-64 h-64 rounded-3xl overflow-hidden mb-8 bg-neutral-800 shadow-2xl"
      >
        <img
          src={currentGif}
          alt={`${count} deepworks`}
          className="w-full h-full object-cover"
        />
      </motion.div>

      <div className="text-center max-w-md w-full">
        <h2 className="text-3xl font-semibold mb-2">Configura tu sesión</h2>

        {/* Count Slider */}
        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-4">Número de deepworks (Sugerido: {suggestedCount})</p>
          <div className="flex justify-center gap-3">
            {options.map((num) => (
              <button
                key={num}
                onClick={() => setCount(num)}
                className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all ${count === num
                  ? 'bg-gold-500 text-black scale-110'
                  : 'bg-neutral-800 text-gray-400 hover:bg-neutral-700'
                  }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Duration Slider */}
        <div className="mb-10 bg-neutral-850/50 p-4 rounded-3xl border border-neutral-800">
          <p className="text-gray-400 text-sm mb-4">Minutos por deepwork</p>
          <div className="flex justify-center gap-2">
            {durationOptions.map((mins) => (
              <button
                key={mins}
                onClick={() => setDuration(mins)}
                className={`flex-1 py-3 rounded-2xl font-semibold transition-all ${duration === mins
                  ? 'bg-gold-500 text-black scale-105'
                  : 'bg-neutral-800 text-gray-400 hover:bg-neutral-700'
                  }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onStart(count, duration)}
          className="w-full max-w-xs py-4 px-8 bg-gold-500 hover:bg-gold-600 text-black font-semibold rounded-full text-lg transition-colors"
        >
          COMENZAR
        </motion.button>
      </div>
    </motion.div>
  )
}

// 4. WARM-UP SCREEN
function WarmUpScreen({ mood, currentDeepwork, totalDeepworks, duration, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [showConfetti, setShowConfetti] = useState(false)
  const endTimeRef = useRef(Date.now() + duration * 1000)
  const isCompletingRef = useRef(false)

  // Temporizador basado en tiempo absoluto
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000))
      setTimeLeft(remaining)
      if (remaining <= 0) clearInterval(timer)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Lógica de finalización
  useEffect(() => {
    if (timeLeft <= 0 && !isCompletingRef.current) {
      isCompletingRef.current = true
      setShowConfetti(true)
      const t = setTimeout(onComplete, 1500)
      return () => clearTimeout(t)
    }
  }, [timeLeft, onComplete])

  const progress = ((duration - timeLeft) / duration) * 100
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-full flex flex-col bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950"
    >
      {/* Header */}
      <div className="p-6 flex items-center justify-between">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-500/20 to-gold-700/20 animate-pulse" />
        <div className="text-center">
          <p className="text-gray-400 text-sm">Deepwork {currentDeepwork} de {totalDeepworks}</p>
          <p className="text-white font-medium">Warm-up</p>
        </div>
        <div className="w-16" />
      </div>

      {/* Timer */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <motion.div className="relative">
          {/* Progress Ring */}
          <svg className="w-80 h-80 transform -rotate-90">
            <circle
              cx="160"
              cy="160"
              r="140"
              stroke="#374151"
              strokeWidth="8"
              fill="none"
            />
            <motion.circle
              cx="160"
              cy="160"
              r="140"
              stroke="#F59E0B"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              initial={{ strokeDashoffset: 880 }}
              animate={{ strokeDashoffset: 880 - (880 * progress) / 100 }}
              style={{ strokeDasharray: 880 }}
              transition={{ duration: 1 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-7xl font-bold">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-gray-400 text-center max-w-md"
        >
          Escaneando... sin presión de entender
        </motion.p>
      </div>

      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: '50vw', y: '50vh', opacity: 1 }}
              animate={{
                x: Math.random() * window.innerWidth,
                y: -100,
                opacity: 0,
                rotate: 720
              }}
              transition={{ duration: 1, delay: i * 0.05 }}
              className="absolute w-4 h-4 bg-gold-500 rounded-full"
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}

// 5. QUESTIONS SCREEN
function QuestionsScreen({ onStart }) {
  const [q1, setQ1] = useState('')
  const [q2, setQ2] = useState('')
  const [q3, setQ3] = useState('')

  const handleStart = () => {
    const filtered = [q1, q2, q3].filter(q => q.trim() !== '')
    // Si no hay preguntas, usamos placeholder amable para no bloquear
    const questions = filtered.length > 0 ? filtered : ['Enfocarse en la tarea de hoy']
    onStart(questions)
  }

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '-100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="min-h-screen w-full flex flex-col bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 px-8 py-12"
    >
      <div className="max-w-2xl w-full mx-auto flex-1 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-semibold mb-2">¿Qué preguntas te surgieron?</h2>
          <p className="text-gray-400 text-sm">En el warm-up, ¿qué te llamó la atención?</p>
        </motion.div>

        <div className="space-y-6 flex-1">
          <motion.input
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            type="text"
            value={q1}
            onChange={(e) => setQ1(e.target.value)}
            placeholder="Pregunta 1..."
            className="w-full p-5 bg-neutral-850/50 border border-neutral-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors text-lg"
          />
          <motion.input
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            type="text"
            value={q2}
            onChange={(e) => setQ2(e.target.value)}
            placeholder="Pregunta 2 (opcional)..."
            className="w-full p-5 bg-neutral-850/50 border border-neutral-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors text-lg"
          />
          <motion.input
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            type="text"
            value={q3}
            onChange={(e) => setQ3(e.target.value)}
            placeholder="Pregunta 3 (opcional)..."
            className="w-full p-5 bg-neutral-850/50 border border-neutral-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors text-lg"
          />
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleStart}
          className="w-full py-5 bg-gold-500 hover:bg-gold-600 text-black font-semibold rounded-full text-lg transition-colors mt-8"
        >
          EMPEZAR AHORA
        </motion.button>
      </div>
    </motion.div>
  )
}

// 5.5 MINI CONFETTI FOR REWARDS
function MiniConfetti() {
  const pieces = Array.from({ length: 50 })
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-50">
      {pieces.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{ backgroundColor: ['#F59E0B', '#3B82F6', '#10B981', '#EF4444', '#8B5CF6'][i % 5] }}
          initial={{ x: 0, y: 0, scale: 0 }}
          animate={{
            x: (Math.random() - 0.5) * 400,
            y: (Math.random() - 0.5) * 400 - 100,
            scale: [0, 1.5, 0],
            opacity: [1, 1, 0]
          }}
          transition={{ duration: 1 + Math.random(), ease: "easeOut" }}
        />
      ))}
    </div>
  )
}

// 6. FOCUS SCREEN
function FocusScreen({ mood, duration, questions, currentQuestionIndex, completedQuestions, onAddQuestion, onCompleteQuestion, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [showAddQuestion, setShowAddQuestion] = useState(false)
  const [newQuestion, setNewQuestion] = useState('')
  const [showInbox, setShowInbox] = useState(false)
  const [inboxText, setInboxText] = useState('')
  const [inboxItems, setInboxItems] = useState([])
  const [showConfetti, setShowConfetti] = useState(false)
  const [bgAudio, setBgAudio] = useState("")
  const audioRef = useRef(null)
  const endTimeRef = useRef(Date.now() + duration * 1000)
  const isCompletingRef = useRef(false)

  useEffect(() => {
    if (audioRef.current) {
      if (bgAudio) {
        audioRef.current.src = bgAudio
        audioRef.current.volume = 0.4
        audioRef.current.play().catch(e => console.log('Audio play error:', e))
      } else {
        audioRef.current.pause()
      }
    }
  }, [bgAudio])

  // Temporizador basado en tiempo absoluto
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000))
      setTimeLeft(remaining)
      if (remaining <= 0) clearInterval(timer)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Lógica de finalización
  useEffect(() => {
    if ((timeLeft <= 0 || completedQuestions.length === questions.length) && !isCompletingRef.current) {
      isCompletingRef.current = true
      onComplete({
        duration: duration - timeLeft,
        questionsAnswered: completedQuestions.length,
        inboxItems: inboxItems
      })
    }
  }, [timeLeft, completedQuestions.length, questions.length, duration, onComplete, inboxItems])

  const progress = ((duration - timeLeft) / duration) * 100
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  const handleCompleteQuestion = () => {
    // Sonido de recompensa (pop/ding de cristal)
    const sound = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3')
    sound.play().catch(e => console.log(e))

    // Confeti
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 2000)

    onCompleteQuestion()
  }

  const handleAddQuestion = () => {
    if (newQuestion.trim()) {
      onAddQuestion(newQuestion)
      setNewQuestion('')
      setShowAddQuestion(false)
    }
  }

  const handleAddInbox = (e) => {
    e.preventDefault();
    if (inboxText.trim()) {
      setInboxItems(prev => [...prev, inboxText.trim()]);
      setInboxText('');
      setShowInbox(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-full flex flex-col"
      style={{ background: '#080808', fontFamily: "'Rajdhani', sans-serif" }}
    >
      <audio ref={audioRef} loop playsInline />
      {showConfetti && <MiniConfetti />}

      {/* Scanline overlay */}
      <div className="hud-scanline" />

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(249,115,22,0.05) 0%, transparent 70%)'
      }} />

      {/* Header */}
      <div className="flex items-center justify-between px-4 h-[44px] shrink-0 border-b border-orange-500/10 z-10"
        style={{ background: 'rgba(249,115,22,0.03)' }}>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded" style={{
            background: 'linear-gradient(135deg, #f97316, #ef4444)',
            boxShadow: '0 0 10px rgba(249,115,22,0.5)'
          }} />
          <div className="flex flex-col">
            <span className="hud-title text-white text-xs tracking-widest leading-none">SESIÓN DE ENFOQUE</span>
            <span className="hud-label text-[8px] mt-0.5 leading-none" style={{ color: 'rgba(249,115,22,0.5)' }}>
              TAREA {currentQuestionIndex + 1} DE {questions.length}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 relative">
          {/* Selector de ruido blanco en modo HUD */}
          <div className="relative">
            <select
              className="bg-neutral-950/85 text-[10px] py-1 px-3 rounded-none text-orange-400 focus:outline-none border border-orange-500/30 appearance-none text-center cursor-pointer hover:border-orange-500/60 transition-colors uppercase"
              style={{ fontFamily: "'Share Tech Mono', monospace", letterSpacing: '0.08em' }}
              value={bgAudio}
              onChange={(e) => setBgAudio(e.target.value)}
              title="Ruido de fondo"
            >
              <option value="">🔇 SILENCIO</option>
              <option value="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3">🎧 LOFI</option>
              <option value="https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg">🌧️ LLUVIA</option>
              <option value="https://actions.google.com/sounds/v1/water/waterfall_medium.ogg">🌊 MARRÓN</option>
            </select>
          </div>
        </div>
      </div>

      {/* Timer & Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-6 z-10">
        
        {/* Circular Timer Dial */}
        <div className="relative my-4 flex items-center justify-center" style={{ width: 256, height: 256 }}>
          <svg viewBox="0 0 256 256" className="absolute inset-0 w-full h-full"
            style={{ filter: 'drop-shadow(0 0 4px rgba(249,115,22,0.2))' }}>
            {/* Outer glow ring */}
            <circle cx="128" cy="128" r="120" fill="none" stroke="rgba(249,115,22,0.03)" strokeWidth="16" />
            {/* Track */}
            <circle cx="128" cy="128" r="110" fill="none" stroke="rgba(249,115,22,0.08)" strokeWidth="8" />
            {/* 36 tick marks */}
            {Array.from({ length: 36 }).map((_, i) => {
              const angle = (i / 36) * 360 - 90
              const rad = angle * Math.PI / 180
              const isMajor = i % 6 === 0
              const r1 = 110 - (isMajor ? 8 : 4)
              const r2 = 110 + (isMajor ? 3 : 1)
              return (
                <line
                  key={i}
                  x1={128 + r1 * Math.cos(rad)} y1={128 + r1 * Math.sin(rad)}
                  x2={128 + r2 * Math.cos(rad)} y2={128 + r2 * Math.sin(rad)}
                  stroke={isMajor ? 'rgba(249,115,22,0.25)' : 'rgba(249,115,22,0.08)'}
                  strokeWidth={isMajor ? 1.5 : 0.8}
                />
              )
            })}
            {/* Progress arc */}
            <motion.circle
              cx="128" cy="128" r="110"
              fill="none" stroke="#f97316" strokeWidth="8" strokeLinecap="butt"
              strokeDasharray={`${2 * Math.PI * 110}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 110 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 110 * (1 - progress / 100) }}
              transition={{ duration: 0.5, ease: 'linear' }}
              transform="rotate(-90 128 128)"
              style={{ filter: 'drop-shadow(0 0 8px rgba(249,115,22,0.9))' }}
            />
            {/* Inner decorative ring */}
            <circle cx="128" cy="128" r="95" fill="none" stroke="rgba(249,115,22,0.05)" strokeWidth="1" strokeDasharray="5 5" />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="hud-number text-5xl font-bold tracking-wider"
              style={{
                color: '#f97316',
                textShadow: '0 0 20px rgba(249,115,22,0.6), 0 0 40px rgba(249,115,22,0.2)',
                fontFamily: "'Orbitron', sans-serif"
              }}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="hud-label text-[8px] mt-1" style={{ color: 'rgba(249,115,22,0.4)', letterSpacing: '0.15em' }}>
              // TIME_REMAINING
            </span>
          </div>
        </div>

        {/* Current Question Styled as HudPanel */}
        <HudPanel title="OBJETIVO_DE_ENFOQUE" mod="DW-T02" id="0048-Q" dotStatus="active" className="w-full max-w-sm mb-6">
          <h3 className="text-xl font-bold text-center text-orange-400 py-2" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            {questions[currentQuestionIndex]}
          </h3>
        </HudPanel>

        {/* Actions Section */}
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <div className="flex gap-3 w-full">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowAddQuestion(true)}
              className="flex-1 flex items-center justify-center gap-2"
              style={{
                padding: '10px 14px',
                background: 'rgba(249,115,22,0.04)',
                border: '1px solid rgba(249,115,22,0.3)',
                clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)',
                cursor: 'pointer',
                color: '#f97316'
              }}
            >
              <Plus size={16} />
              <span className="hud-label font-bold text-xs" style={{ color: '#f97316' }}>PREGUNTA</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowInbox(true)}
              className="flex-1 flex items-center justify-center gap-2"
              style={{
                padding: '10px 14px',
                background: 'rgba(59,130,246,0.04)',
                border: '1px solid rgba(59,130,246,0.3)',
                clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)',
                cursor: 'pointer',
                color: '#60a5fa'
              }}
            >
              <Plus size={16} />
              <span className="hud-label font-bold text-xs" style={{ color: '#60a5fa' }}>DISTRACCIÓN</span>
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCompleteQuestion}
            disabled={completedQuestions.includes(currentQuestionIndex)}
            className="w-full flex items-center justify-center gap-2 hud-glow-orange disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              padding: '14px 20px',
              background: 'linear-gradient(135deg, #f97316, #ef4444)',
              color: '#000',
              fontWeight: 800,
              fontSize: 14,
              letterSpacing: '0.15em',
              clipPath: 'polygon(10px 0%, calc(100% - 10px) 0%, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0% calc(100% - 10px), 0% 10px)',
              cursor: 'pointer'
            }}
          >
            <Check size={18} />
            <span>COMPLETÉ ESTO</span>
          </motion.button>
        </div>
      </div>

      {/* Add Question Modal */}
      <AnimatePresence>
        {showAddQuestion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-8 z-50"
            onClick={() => setShowAddQuestion(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-neutral-850 p-8 rounded-3xl max-w-md w-full"
            >
              <h3 className="text-2xl font-semibold mb-4">Nueva pregunta</h3>
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="¿Qué quieres investigar?"
                className="w-full p-4 bg-neutral-900 border border-neutral-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 mb-4"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddQuestion(false)}
                  className="flex-1 py-3 bg-neutral-700 hover:bg-neutral-600 rounded-full transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddQuestion}
                  className="flex-1 py-3 bg-gold-500 hover:bg-gold-600 text-black rounded-full transition-colors"
                >
                  Agregar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inbox Modal (Panic Button) */}
      <AnimatePresence>
        {showInbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-8 z-50 backdrop-blur-sm"
            onClick={() => setShowInbox(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-neutral-900 p-8 rounded-3xl max-w-md w-full border border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.15)]"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">💡</span>
                <h3 className="text-2xl font-semibold text-blue-400">Inbox de Distracciones</h3>
              </div>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                Descarga aquí cualquier pensamiento, idea o pendiente que te esté distrayendo. Tu cerebro puede soltarlo; está a salvo aquí.
              </p>

              <form onSubmit={handleAddInbox}>
                <input
                  type="text"
                  value={inboxText}
                  onChange={(e) => setInboxText(e.target.value)}
                  placeholder="Ej: Pagar la luz, escribirle a mamá, buscar vuelo..."
                  className="w-full p-4 bg-neutral-950 border border-neutral-700 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 mb-6 transition-colors"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowInbox(false)}
                    className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 font-medium rounded-full transition-colors"
                  >
                    Descartar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                  >
                    Guardar y Volver
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// 6.5 BREAK SCREEN
const BREAK_TIPS = [
  '💧 Toma un vaso de agua',
  '🧘 Respira profundo — 4 segundos adentro, 4 afuera',
  '👀 Mira por la ventana o un punto lejano por 1 minuto',
  '🚶 Da unos pasos, mueve el cuerpo',
  '🤸 Estira el cuello y los hombros',
  '😊 Sonríe — tu cerebro acaba de hacer algo valioso',
]

function BreakScreen({ duration, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [tipIndex] = useState(() => Math.floor(Math.random() * BREAK_TIPS.length))
  const endTimeRef = useRef(Date.now() + duration * 1000)
  const isCompletingRef = useRef(false)

  // Temporizador basado en tiempo absoluto
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000))
      setTimeLeft(remaining)
      if (remaining <= 0) clearInterval(timer)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Lógica de finalización
  useEffect(() => {
    if (timeLeft <= 0 && !isCompletingRef.current) {
      isCompletingRef.current = true
      onComplete()
    }
  }, [timeLeft, onComplete])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const progress = ((duration - timeLeft) / duration) * 100

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-950 via-neutral-900 to-blue-950 px-8"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-12"
      >
        <span className="text-6xl mb-6 block">☕</span>
        <h2 className="text-4xl font-bold text-blue-400 mb-2">¡Buen trabajo! Descansa.</h2>
        {/* Tip rotativo */}
        <motion.p
          key={tipIndex}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-gray-300 text-lg mt-3 font-medium"
        >
          {BREAK_TIPS[tipIndex]}
        </motion.p>
      </motion.div>

      <div className="relative mb-12">
        <svg className="w-64 h-64 transform -rotate-90">
          <circle cx="128" cy="128" r="110" stroke="#1e3a8a" strokeWidth="6" fill="none" />
          <motion.circle
            cx="128" cy="128" r="110" stroke="#3b82f6" strokeWidth="6" fill="none"
            strokeLinecap="round"
            style={{ strokeDasharray: 691, strokeDashoffset: 691 - (691 * progress) / 100 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl font-bold text-blue-400">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
      </div>

      <button
        onClick={onComplete}
        className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 text-gray-300 font-medium rounded-full transition-colors"
      >
        Saltar descanso
      </button>
    </motion.div>
  )
}

// 7. SYNTHESIS SCREEN (Feynman)
function SynthesisScreen({ onNext }) {
  const [explanation, setExplanation] = useState('')
  const [stuckOn, setStuckOn] = useState([])

  const toggleStuck = (part) => {
    setStuckOn(prev =>
      prev.includes(part) ? prev.filter(p => p !== part) : [...prev, part]
    )
  }

  const handleNext = (skip = false) => {
    // Síntesis opcional — no bloqueamos si el cerebro está cansado
    onNext({ explanation: skip ? '' : explanation, stuckOn, skipped: skip })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-full flex flex-col bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 px-8 py-12"
    >
      <div className="max-w-3xl w-full mx-auto flex-1 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-semibold mb-2">Explícalo como si fuera a un niño</h2>
          <p className="text-gray-400 text-sm">Método Feynman: simplifica al máximo</p>
        </motion.div>

        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="¿Qué aprendiste? Explícalo con tus propias palabras..."
          className="w-full flex-1 min-h-[300px] p-6 bg-neutral-850/50 border border-neutral-700 rounded-3xl text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors resize-none mb-8"
        />

        <div className="mb-8">
          <p className="text-lg font-medium mb-4">¿Dónde te trabaste?</p>
          <div className="flex gap-4 flex-wrap">
            {['Parte A', 'Parte B', 'Todo bien'].map((part) => (
              <button
                key={part}
                onClick={() => toggleStuck(part)}
                className={`px-6 py-3 rounded-full transition-all ${stuckOn.includes(part)
                  ? 'bg-gold-500 text-black'
                  : 'bg-neutral-800 text-gray-300 hover:bg-neutral-700'
                  }`}
              >
                {stuckOn.includes(part) && <Check className="inline mr-2" size={18} />}
                {part}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleNext(false)}
            className="w-full py-5 bg-gold-500 hover:bg-gold-600 text-black font-semibold rounded-full text-lg transition-colors"
          >
            Guardar síntesis
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleNext(true)}
            className="w-full py-3 text-gray-400 hover:text-gray-200 text-sm transition-colors rounded-full hover:bg-neutral-800"
          >
            Saltar por ahora
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

// 8. EVIDENCE SCREEN (Anti-Cobra)
function EvidenceScreen({ onNext }) {
  const [selectedType, setSelectedType] = useState(null)
  const [content, setContent] = useState('')

  const evidenceTypes = [
    { id: 'screenshot', icon: '📸', label: 'Screenshot' },
    { id: 'link', icon: '🔗', label: 'Link' },
    { id: 'flashcard', icon: '📝', label: 'Flashcard' },
    { id: 'audio', icon: '🎤', label: 'Audio 30s' },
  ]

  const handleNext = (skip = false) => {
    if (skip) {
      onNext({ type: null, content: '', skipped: true })
      return
    }
    // Evidencia opcional — si no seleccionó nada, guardamos como 'none'
    onNext({ type: selectedType || 'none', content })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-full flex flex-col bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 px-8 py-12"
    >
      <div className="max-w-2xl w-full mx-auto flex-1 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-semibold mb-2">¿Qué produjiste?</h2>
          <p className="text-gray-400 text-sm mb-2">Opcional — guarda algo si quieres recordarlo</p>
          <p className="text-indigo-300 text-xs font-medium">✨ Tu trabajo ya cuenta, lo registres o no</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {evidenceTypes.map((type, index) => (
            <motion.button
              key={type.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedType(type.id)}
              className={`p-6 rounded-2xl transition-all ${selectedType === type.id
                ? 'bg-gold-500 text-black scale-105'
                : 'bg-neutral-850/50 hover:bg-neutral-850'
                }`}
            >
              <div className="text-4xl mb-2">{type.icon}</div>
              <div className="font-medium">{type.label}</div>
            </motion.button>
          ))}
        </div>

        {/* Content Input */}
        {selectedType && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex-1"
          >
            {selectedType === 'link' && (
              <input
                type="url"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="https://..."
                className="w-full p-5 bg-neutral-850/50 border border-neutral-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-gold-500"
              />
            )}
            {selectedType === 'flashcard' && (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escribe tu flashcard..."
                className="w-full h-40 p-5 bg-neutral-850/50 border border-neutral-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 resize-none"
              />
            )}
            {selectedType === 'screenshot' && (
              <div className="p-8 border-2 border-dashed border-neutral-700 rounded-2xl text-center">
                <p className="text-gray-400 mb-4">Selecciona tu screenshot</p>
                <button
                  onClick={() => setContent('screenshot_selected.png')}
                  className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-full transition-colors"
                >
                  Seleccionar archivo
                </button>
              </div>
            )}
            {selectedType === 'audio' && (
              <div className="p-8 border-2 border-dashed border-neutral-700 rounded-2xl text-center">
                <p className="text-gray-400 mb-4">Graba tu audio de 30s</p>
                <button
                  onClick={() => setContent('audio_recorded.mp3')}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 rounded-full transition-colors flex items-center gap-2 mx-auto"
                >
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                  Grabar
                </button>
              </div>
            )}
          </motion.div>
        )}

        <div className="flex flex-col gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleNext(false)}
            className="w-full py-5 bg-gold-500 hover:bg-gold-600 text-black font-semibold rounded-full text-lg transition-colors"
          >
            Guardar evidencia
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleNext(true)}
            className="w-full py-3 text-gray-400 hover:text-gray-200 text-sm transition-colors rounded-full hover:bg-neutral-800"
          >
            Saltar por ahora
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

// 9. COMPLETED SCREEN
function CompletedScreen({ history, currentDeepwork, totalDeepworks, sessionData, logs, onNextDeepwork, onAddExtraDeepwork, onFinishDay, onExportLogs }) {
  const isLastDeepwork = currentDeepwork >= totalDeepworks

  // Verificar si batió récord de deepworks completados hoy
  const todayStr = new Date().toISOString().split('T')[0]
  const todayDeepworks = history.filter(e => e.date.startsWith(todayStr)).reduce((s, e) => s + (e.deepworksCompleted || 1), 0)

  const otherDaysDeepworks = history.filter(e => !e.date.startsWith(todayStr)).reduce((acc, e) => {
    const d = e.date.split('T')[0]
    acc[d] = (acc[d] || 0) + (e.deepworksCompleted || 1)
    return acc
  }, {})
  const maxOtherDay = Math.max(0, ...Object.values(otherDaysDeepworks))
  const isRecord = todayDeepworks > maxOtherDay && todayDeepworks > 1;

  useEffect(() => {
    // Sonido súper satisfactorio de bloque completado
    const sound = new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3')
    sound.volume = 0.6
    sound.play().catch(e => console.log('Audio error:', e))
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 px-8 py-12"
    >
      {/* Celebration */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 10 }}
        className="mb-8"
      >
        <Sparkles size={80} className="text-gold-500" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-4xl font-bold mb-4"
      >
        ¡Deepwork completado!
      </motion.h2>

      {isRecord && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', delay: 0.6 }}
          className="mb-6 bg-gold-500/10 border border-gold-500/30 text-gold-400 px-6 py-2 rounded-full font-medium inline-flex items-center gap-2"
        >
          <span>🏆</span> ¡Rompiste tu récord de hoy! ({todayDeepworks} deepworks)
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center mb-12"
      >
        <p className="text-2xl text-gray-300 mb-2">
          Deepwork {currentDeepwork} de {totalDeepworks}
        </p>
        <div className="flex gap-2 justify-center mt-4">
          {[...Array(totalDeepworks)].map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${i < currentDeepwork ? 'bg-gold-500' : 'bg-neutral-700'
                }`}
            />
          ))}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-neutral-850/50 backdrop-blur-sm p-8 rounded-3xl max-w-md w-full mb-8"
      >
        <h3 className="text-xl font-semibold mb-4 text-center">Resumen de sesión</h3>
        <div className="space-y-3 text-gray-300">
          <div className="flex justify-between">
            <span>Preguntas respondidas:</span>
            <span className="font-semibold text-gold-500">{sessionData.questionsAnswered || 0}</span>
          </div>
          <div className="flex justify-between">
            <span>Tiempo de focus:</span>
            <span className="font-semibold text-gold-500">
              {Math.floor((sessionData.duration || 0) / 60)}m {(sessionData.duration || 0) % 60}s
            </span>
          </div>
          <div className="flex justify-between">
            <span>Total de eventos:</span>
            <span className="font-semibold text-gold-500">{logs.length}</span>
          </div>
          {sessionData.inboxItems?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-neutral-700">
              <span className="block text-blue-400 mb-2 font-medium">Distracciones capturadas:</span>
              <ul className="list-disc pl-5 space-y-1">
                {sessionData.inboxItems.map((item, i) => (
                  <li key={i} className="text-sm text-gray-400">{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.div>

      {/* Actions */}
      <div className="space-y-4 w-full max-w-md">
        {!isLastDeepwork && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNextDeepwork}
            className="w-full py-5 bg-gold-500 hover:bg-gold-600 text-black font-semibold rounded-full text-lg transition-colors"
          >
            Siguiente Deepwork
          </motion.button>
        )}

        {isLastDeepwork && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', damping: 10 }}
              className="text-center py-6"
            >
              <p className="text-3xl font-bold text-gold-500 mb-2">🎊 ¡Felicidades! 🎊</p>
              <p className="text-xl text-gray-300">
                ¡Completaste tus {totalDeepworks} deepworks del día!
              </p>
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onAddExtraDeepwork}
              className="w-full py-5 bg-gold-500 hover:bg-gold-600 text-black font-semibold rounded-full text-lg transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={24} />
              Agregar otro deepwork
            </motion.button>
          </>
        )}

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onExportLogs}
          className="w-full py-5 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-full text-lg transition-colors flex items-center justify-center gap-2"
        >
          <Download size={20} />
          Exportar Logs
        </motion.button>

        {isLastDeepwork && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onFinishDay}
            className="w-full py-4 bg-neutral-700 hover:bg-neutral-600 text-white rounded-full transition-colors"
          >
            Finalizar día
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}

// ============= HEADER COMPONENT =============
function Header({ currentProject, projects, showProjectSelector, setShowProjectSelector, setCurrentProject, onMenuClick }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800">
      <div className="flex items-center justify-between p-4">
        {/* Hamburger Menu */}
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>

        {/* Project Selector */}
        <div className="relative">
          <button
            onClick={() => setShowProjectSelector(!showProjectSelector)}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-850 rounded-xl hover:bg-neutral-800 transition-colors"
          >
            <span className="text-2xl">{currentProject.emoji}</span>
            <span className="font-medium">{currentProject.name}</span>
            <ChevronDown size={18} className={`transition-transform ${showProjectSelector ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          <AnimatePresence>
            {showProjectSelector && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full mt-2 left-0 right-0 bg-neutral-850 rounded-xl overflow-hidden border border-neutral-700 min-w-[200px]"
              >
                {projects.filter(p => p.status !== 'done').map(project => (
                  <button
                    key={project.id}
                    onClick={() => {
                      setCurrentProject(project)
                      setShowProjectSelector(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-800 transition-colors ${currentProject.id === project.id ? 'bg-neutral-800' : ''
                      }`}
                  >
                    <span className="text-xl">{project.emoji}</span>
                    <span>{project.name}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-10" />
      </div>
    </div>
  )
}

// ============= SIDEBAR COMPONENT =============
function Sidebar({ show, onClose, onNavigate, currentScreen }) {
  const menuItems = [
    { id: 'home', icon: PlayCircle, label: 'Iniciar Deepwork', special: true },
    { id: 'projects', icon: Folder, label: 'Proyectos' },
    { id: 'history', icon: History, label: 'Historial' },
    { id: 'metrics', icon: BarChart3, label: 'Métricas' },
    { id: 'calendar', icon: CalendarDays, label: 'Calendario' }
  ]

  const handleNavigate = (id) => {
    if (id === 'home') {
      onNavigate(null)
    } else {
      onNavigate(id)
    }
    onClose()
  }

  const isCurrentActive = (item) => {
    if (item.id === 'home') return currentScreen === null
    return currentScreen === item.id
  }

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-72 z-50 border-r border-orange-500/15"
            style={{ background: '#080808', fontFamily: "'Rajdhani', sans-serif" }}
          >
            {/* Scanline overlay */}
            <div className="hud-scanline" />

            {/* Header */}
            <div className="p-6 border-b border-orange-500/10 flex items-center justify-between relative"
              style={{ background: 'rgba(249,115,22,0.02)' }}>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="hud-dot active" style={{ width: 6, height: 6 }} />
                  <h2 className="hud-title text-white text-lg leading-none tracking-wider font-bold">DEEPWORK</h2>
                </div>
                <span className="hud-label text-[8px] mt-1.5" style={{ color: 'rgba(249,115,22,0.4)', letterSpacing: '0.15em' }}>
                  // SYSTEM_NAVIGATION_CORE
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-orange-400 hover:text-orange-500 transition-colors border border-orange-500/20 hover:border-orange-500/50"
                style={{
                  clipPath: 'polygon(4px 0%, 100% 0%, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0% 100%, 0% 4px)',
                  background: 'rgba(249,115,22,0.02)',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Menu Items */}
            <div className="p-4 flex flex-col gap-3">
              {menuItems.map(item => {
                const active = isCurrentActive(item)
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 transition-all text-left relative overflow-hidden"
                    style={{
                      background: item.special
                        ? 'linear-gradient(135deg, #f97316, #ef4444)'
                        : active
                          ? 'rgba(249,115,22,0.08)'
                          : 'rgba(0,0,0,0.45)',
                      border: item.special
                        ? '1px solid rgba(249,115,22,0.8)'
                        : active
                          ? '1px solid rgba(249,115,22,0.6)'
                          : '1px solid rgba(249,115,22,0.15)',
                      color: item.special
                        ? '#000'
                        : active
                          ? '#f97316'
                          : '#9ca3af',
                      fontWeight: item.special || active ? 700 : 500,
                      clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)',
                      cursor: 'pointer',
                      boxShadow: (item.special || active) ? '0 0 10px rgba(249,115,22,0.2)' : 'none'
                    }}
                  >
                    {item.special && <div className="hud-stripe absolute top-0 left-0 right-0" style={{ height: 2 }} />}
                    
                    <item.icon size={18} className={active && !item.special ? 'text-orange-500' : ''} />
                    <span className="hud-title text-xs tracking-wider" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                      {item.special ? item.label.toUpperCase() : `// ${item.label.toUpperCase()}`}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-orange-500/10 flex flex-col items-center gap-1"
              style={{ background: 'rgba(0,0,0,0.3)', fontFamily: "'Share Tech Mono', monospace" }}>
              <div className="flex items-center gap-2">
                <span className="hud-dot active" style={{ width: 5, height: 5 }} />
                <span className="text-[9px] text-gray-500 tracking-wider">ADHD_CORE // ON_STANDBY</span>
              </div>
              <p className="text-[8px] text-gray-600">SYS_OPT_FRAME // v1.2.0</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ============= NEW NAVIGATION SCREENS =============

// Activity categories
const ACTIVITY_TEMPLATES = {
  principales: [
    {
      name: 'Tesis',
      emoji: '📝',
      category: 'principal',
      gif: 'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3bnpvbWU1Y2F5cW04dThsOWtlZDcyNW9zOTh2eXBnbjN5Z2Z4b2E3ZCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/LpiA8MVudQO8pitF4c/giphy.gif',
      focusExample: 'Ej: Redactar capítulo 2, revisar bibliografía, avanzar marco teórico…',
    },
    {
      name: 'Programación',
      emoji: '💻',
      category: 'principal',
      gif: 'https://media.giphy.com/media/U4ZItT6PM3leNZsBtt/giphy.gif',
      focusExample: 'Ej: Implementar feature X, resolver bug Y, aprender concepto Z…',
    },
    {
      name: 'Redes',
      emoji: '📡',
      category: 'principal',
      gif: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExc3VhODQxc2cxbW83OXVqbTBxYTJuaGwwbjhyMnlqc2RsazliaGxoNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/TjFUxbRz3cgfbHmQxs/giphy.gif',
      focusExample: 'Ej: Estudiar protocolo TCP/IP, practicar subneting, repasar OSI…',
    },
    {
      name: 'Inteligencia Artificial',
      emoji: '🧠',
      category: 'principal',
      gif: 'https://media.giphy.com/media/Tk0g95CHcEuLVveAj3/giphy.gif',
      focusExample: 'Ej: Implementar modelo X, estudiar paper Y, practicar con dataset Z…',
    },
  ],
  complementarias: [
    {
      name: 'Inglés',
      emoji: '🌎',
      category: 'complementaria',
      gif: 'https://media.giphy.com/media/TKDSgScrDV3yPKXMfI/giphy.gif',
      focusExample: 'Ej: 20 flashcards nuevas, escuchar podcast 30 min, vocabulario de redes…',
    },
    {
      name: 'Entrenamiento de fuerza',
      emoji: '🏋️',
      category: 'complementaria',
      gif: 'https://media.giphy.com/media/yYU6Mivn9bhV0x8BmX/giphy.gif',
      focusExample: 'Ej: Press banca 4×10, sentadilla progresiva, 10 series de X…',
    },
    {
      name: 'Improvisación',
      emoji: '🎭',
      category: 'complementaria',
      gif: 'https://media.giphy.com/media/UkkOy67JwSPAGOtuXS/giphy.gif',
      focusExample: 'Ej: 15 min de impro en inglés, narrar sin parar 10 min en español…',
    },
    {
      name: 'Lectura',
      emoji: '📚',
      category: 'complementaria',
      gif: 'https://media.giphy.com/media/YWOs5jNvBu9VVpw37A/giphy.gif',
      focusExample: 'Ej: 30 páginas de X, leer artículo técnico, capítulo del libro Y…',
    },
    {
      name: 'Shadowing YouTube',
      emoji: '🎙️',
      category: 'complementaria',
      gif: 'https://media.giphy.com/media/FSZoHhWyU5iESIz0lo/giphy.gif',
      focusExample: 'Ej: 1 video ×3 repeticiones, imitar pronunciación de X hablante…',
    },
  ],
  custom: [
    { name: 'Proyecto personalizado', emoji: '📁', category: 'custom', gif: '', focusExample: 'Describe de qué va tu proyecto…' },
  ]
}

// Flat list kept for legacy compatibility
const PROJECT_TEMPLATES = [
  ...ACTIVITY_TEMPLATES.principales,
  ...ACTIVITY_TEMPLATES.complementarias,
  ...ACTIVITY_TEMPLATES.custom,
]


// PROJECTS SCREEN
function ProjectsScreen({ projects, currentProject, onSelectProject, onAddProject, onDeleteProject, onUpdateProject, history }) {
  const [showNewProject, setShowNewProject] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [showArchived, setShowArchived] = useState(false)
  const [step, setStep] = useState('template') // 'template' | 'confirm' | 'duration' | 'custom'
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [customName, setCustomName] = useState('')
  const [customGif, setCustomGif] = useState('')
  const [customEmoji, setCustomEmoji] = useState('📁')
  const [plannedDays, setPlannedDays] = useState(7)
  const [hoursGoal, setHoursGoal] = useState(10)
  const [projectFocus, setProjectFocus] = useState('')

  const emojis = ['📚', '💻', '🎨', '🏋️', '🎵', '📝', '🔬', '📊', '🎯', '💡', '⚔️', '🛡️', '🚀', '🌟', '⚡', '🌅', '🌌', '🧭']

  const STATUS_CONFIG = {
    in_progress: { label: 'In progress', color: 'bg-blue-500/20 text-blue-300 border border-blue-500/30' },
    done: { label: 'Done', color: 'bg-green-500/20 text-green-300 border border-green-500/30' },
    paused: { label: 'Paused', color: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' },
  }

  const openNew = () => {
    setStep('template')
    setSelectedTemplate(null)
    setCustomName('')
    setCustomGif('')
    setCustomEmoji('📁')
    setPlannedDays(7)
    setHoursGoal(10)
    setProjectFocus('')
    setShowNewProject(true)
  }

  const handleSelectTemplate = (tpl) => {
    setSelectedTemplate(tpl)
    if (tpl.name === 'Proyecto personalizado') {
      setStep('custom')
    } else {
      setStep('confirm')
    }
  }

  const handleCreate = () => {
    const isCustom = step === 'custom' || (step === 'duration' && selectedTemplate?.name === 'Proyecto personalizado')
    const name = isCustom ? customName.trim() : selectedTemplate?.name
    if (!name) return
    const newProject = {
      id: Date.now().toString(),
      name,
      emoji: isCustom ? customEmoji : selectedTemplate.emoji,
      gif: isCustom ? customGif.trim() : selectedTemplate.gif,
      createdAt: new Date().toISOString(),
      totalDeepworks: 0,
      status: 'in_progress',
      plannedDays,
      hoursGoal,
      hoursLogged: 0,
      focus: projectFocus.trim(),
    }
    onAddProject(newProject)
    setShowNewProject(false)
  }

  const getProjectStats = (projectId) => {
    const entries = (history || []).filter(e => e.projectId === projectId)
    const minutes = Math.round(entries.reduce((s, e) => s + e.duration, 0) / 60)
    return {
      sessions: entries.length,
      deepworks: entries.reduce((s, e) => s + e.deepworksCompleted, 0),
      hours: +(minutes / 60).toFixed(2),
      entries
    }
  }

  const motivationalMsg = (pct) => {
    if (pct >= 100) return '🏆 ¡Meta alcanzada! Increíble.'
    if (pct >= 80) return '🔥 ¡Casi! Estás muy cerca del objetivo'
    if (pct >= 50) return '💪 Buen avance — más de la mitad hecho'
    if (pct >= 20) return '🌱 Cada sesión suma. Vas construyendo'
    return '✨ El primer paso es comenzar'
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-full pt-20 pb-8 px-4 sm:px-6 relative text-white"
      style={{ background: '#080808', fontFamily: "'Rajdhani', sans-serif" }}
    >
      {/* Scanline overlay */}
      <div className="hud-scanline" />

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(249,115,22,0.03) 0%, transparent 70%)'
      }} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-4 z-10 relative">
        <div>
          <h1 className="text-3xl font-bold tracking-widest text-white uppercase leading-none">// PROYECTOS</h1>
          <span className="hud-label text-[8px]" style={{ color: 'rgba(249,115,22,0.4)', letterSpacing: '0.15em' }}>
            SYSTEM_DATABASE_INDEX
          </span>
        </div>
        <div className="flex items-center gap-2">
          {(() => {
            const archivedCount = projects.filter(p => p.status === 'done').length
            return archivedCount > 0 ? (
              <button
                onClick={() => setShowArchived(v => !v)}
                className={`flex items-center gap-1.5 px-4 py-2.5 font-bold transition-all text-xs tracking-wider uppercase border ${
                  showArchived
                    ? 'bg-neutral-850 border-orange-500/80 text-orange-400'
                    : 'bg-neutral-950 border-orange-500/20 text-gray-400 hover:border-orange-500/50 hover:text-orange-300'
                }`}
                style={{
                  clipPath: 'polygon(6px 0%, 100% 0%, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0% 100%, 0% 6px)',
                  cursor: 'pointer'
                }}
              >
                🗃️ Archivados ({archivedCount})
              </button>
            ) : null
          })()}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openNew}
            className="flex items-center gap-2 px-5 py-2.5 hud-glow-orange text-black font-extrabold text-xs tracking-widest uppercase"
            style={{
              background: 'linear-gradient(135deg, #f97316, #ef4444)',
              clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)',
              cursor: 'pointer'
            }}
          >
            <Plus size={16} />
            Nuevo
          </motion.button>
        </div>
      </div>

      {/* ── KANBAN HORIZONTAL SCROLL ── */}
      <div className="flex gap-4 overflow-x-auto px-4 pb-6 z-10 relative scrollbar-thin" style={{ scrollSnapType: 'x mandatory' }}>
        {(showArchived
          ? projects.filter(p => p.status === 'done')
          : projects.filter(p => p.status !== 'done')
        ).map(project => {
          const stats = getProjectStats(project.id)
          const isActive = currentProject?.id === project.id
          const status = project.status || 'in_progress'
          const statusCfg = STATUS_CONFIG[status]
          const hoursGoalVal = project.hoursGoal || 1
          const hoursLogged = stats.hours
          const pct = Math.min(Math.round((hoursLogged / hoursGoalVal) * 100), 100)
          const daysLeft = project.plannedDays
            ? Math.max(0, project.plannedDays - Math.floor((Date.now() - new Date(project.createdAt)) / 86400000))
            : null

          return (
            <motion.div
              key={project.id}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedProject(project)}
              className="flex-shrink-0 cursor-pointer transition-all relative overflow-hidden flex flex-col justify-between"
              style={{
                scrollSnapAlign: 'start',
                background: '#0d0d0d',
                border: isActive ? '1px solid #f97316' : '1px solid rgba(249,115,22,0.15)',
                clipPath: 'polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)',
                boxShadow: isActive ? '0 0 15px rgba(249,115,22,0.15)' : 'none',
                width: '224px',
                height: '310px'
              }}
            >
              {/* Media Container */}
              <div className="h-36 relative overflow-hidden w-full border-b border-orange-500/10 bg-neutral-950">
                {project.gif ? (
                  <img src={project.gif} alt={project.name} className="w-full h-full object-cover opacity-80" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-5xl relative">
                    {/* Retro Grid Background inside Empty Card */}
                    <div className="absolute inset-0 opacity-[0.05]" style={{
                      backgroundImage: 'linear-gradient(rgba(249,115,22,1) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,1) 1px, transparent 1px)',
                      backgroundSize: '15px 15px'
                    }} />
                    <span>{project.emoji}</span>
                  </div>
                )}
                {isActive && (
                  <div className="absolute top-2 left-2 bg-orange-500 text-black text-[9px] font-extrabold px-2 py-0.5 tracking-widest uppercase"
                    style={{ clipPath: 'polygon(4px 0%, 100% 0%, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0% 100%, 0% 4px)' }}>
                    ACTIVO
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <p className="font-bold text-sm leading-tight text-white mb-1 uppercase tracking-wider line-clamp-2"
                    style={{ textShadow: isActive ? '0 0 8px rgba(249,115,22,0.3)' : 'none' }}>
                    {project.name}
                  </p>

                  {daysLeft !== null && (
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 font-mono">
                      {daysLeft > 0 ? `// ${daysLeft} DÍAS RESTANTES` : '// EN CURSO'}
                    </p>
                  )}
                </div>

                <div>
                  {/* Hours progress bar */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-[10px] mb-1 font-mono">
                      <span className="text-orange-400">{pct}% 💡 HORAS</span>
                      <span className="text-gray-500">{hoursLogged}h / {hoursGoalVal}h</span>
                    </div>
                    <div className="w-full bg-neutral-950 border border-orange-500/10 h-2"
                      style={{ clipPath: 'polygon(2px 0%, 100% 0%, 100% calc(100% - 2px), calc(100% - 2px) 100%, 0% 100%, 0% 2px)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                      />
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-mono text-[9px] tracking-widest text-orange-500/80 uppercase">
                      [ {statusCfg.label.toUpperCase()} ]
                    </span>
                    <p className="text-[8px] text-gray-500 font-mono tracking-tighter truncate text-right w-2/3">
                      {motivationalMsg(pct)}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}

        {/* Add card button — only in active view */}
        {!showArchived && (
          <button
            onClick={openNew}
            className="flex-shrink-0 flex items-center justify-center transition-colors"
            style={{
              width: '64px',
              height: '310px',
              background: 'rgba(249,115,22,0.02)',
              border: '1px dashed rgba(249,115,22,0.3)',
              clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)',
              cursor: 'pointer'
            }}
          >
            <div className="flex flex-col items-center gap-2">
              <Plus size={20} className="text-orange-500/60" />
              <span className="font-mono text-[8px] text-orange-500/40 uppercase tracking-widest writing-vertical [writing-mode:vertical-lr]">
                NUEVO_PROYECTO
              </span>
            </div>
          </button>
        )}
      </div>

      {/* ── PROJECT DETAIL OVERLAY ── */}
      <AnimatePresence>
        {selectedProject && (() => {
          const stats = getProjectStats(selectedProject.id)
          const isActive = currentProject?.id === selectedProject.id
          const status = selectedProject.status || 'in_progress'
          const hoursGoalVal = selectedProject.hoursGoal || 1
          const pct = Math.min(Math.round((stats.hours / hoursGoalVal) * 100), 100)

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/85 z-50 flex items-end justify-center px-4"
              onClick={() => setSelectedProject(null)}
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto border-t border-l border-r border-orange-500/25 relative"
                style={{
                  background: '#080808',
                  clipPath: 'polygon(16px 0%, calc(100% - 16px) 0%, 100% 16px, 100% 100%, 0% 100%, 0% 16px)'
                }}
              >
                {/* Modal Scanline Overlay */}
                <div className="hud-scanline" />

                {/* Header Media */}
                {selectedProject.gif ? (
                  <div className="h-44 relative w-full border-b border-orange-500/10">
                    <img src={selectedProject.gif} alt={selectedProject.name} className="w-full h-full object-cover opacity-70" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent" />
                    <button
                      onClick={() => setSelectedProject(null)}
                      className="absolute top-4 right-4 w-7 h-7 bg-black/75 border border-orange-500/30 text-orange-400 hover:text-white rounded-none flex items-center justify-center cursor-pointer"
                      style={{ clipPath: 'polygon(4px 0%, 100% 0%, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0% 100%, 0% 4px)' }}
                    >
                      <X size={14} />
                    </button>
                    <div className="absolute bottom-4 left-4">
                      <span className="font-mono text-[9px] tracking-wider text-orange-500 bg-[#080808] border border-orange-500/40 px-2 py-0.5 uppercase">
                        {STATUS_CONFIG[status].label.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center p-4 border-b border-orange-500/10">
                    <span className="font-mono text-[9px] text-gray-500 tracking-wider">// DETALLES_PROYECTO</span>
                    <button onClick={() => setSelectedProject(null)}
                      className="w-7 h-7 bg-black/75 border border-orange-500/30 text-orange-400 hover:text-white flex items-center justify-center cursor-pointer"
                      style={{ clipPath: 'polygon(4px 0%, 100% 0%, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0% 100%, 0% 4px)' }}>
                      <X size={14} />
                    </button>
                  </div>
                )}

                <div className="p-5 relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold leading-tight uppercase tracking-wider text-white">
                        {selectedProject.name}
                      </h2>
                      {isActive && (
                        <span className="text-[9px] text-orange-400 font-mono tracking-widest uppercase">
                          [ // SYSTEM_ACTIVE ]
                        </span>
                      )}
                    </div>
                    <span className="text-3xl p-1.5 bg-neutral-950 border border-orange-500/10"
                      style={{ clipPath: 'polygon(6px 0%, 100% 0%, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0% 100%, 0% 6px)' }}>
                      {selectedProject.emoji}
                    </span>
                  </div>

                  {/* Focus / topic */}
                  {selectedProject.focus && (
                    <div className="mb-4 p-3 border border-orange-500/10 bg-neutral-950"
                      style={{ clipPath: 'polygon(6px 0%, 100% 0%, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0% 100%, 0% 6px)' }}>
                      <p className="font-mono text-[8px] text-orange-400/60 uppercase tracking-widest mb-1">// DESCRIPCIÓN_ENFOQUE</p>
                      <p className="text-sm text-gray-300 leading-relaxed font-sans">{selectedProject.focus}</p>
                    </div>
                  )}

                  {/* Duration info */}
                  {selectedProject.plannedDays && (
                    <div className="grid grid-cols-2 gap-3 mb-4 font-mono text-[10px] uppercase text-gray-400">
                      <div className="p-2 border border-orange-500/5 bg-neutral-950/40 text-center">
                        📅 Días: {selectedProject.plannedDays}
                      </div>
                      <div className="p-2 border border-orange-500/5 bg-neutral-950/40 text-center">
                        🎯 Meta: {selectedProject.hoursGoal}h
                      </div>
                    </div>
                  )}

                  {/* Hours progress bar */}
                  <div className="mb-5">
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1 font-mono">
                      <span>PROGRESO EN HORAS</span>
                      <span className="text-orange-400">{stats.hours}h / {hoursGoalVal}h ({pct}%)</span>
                    </div>
                    <div className="w-full bg-neutral-950 border border-orange-500/15 h-3"
                      style={{ clipPath: 'polygon(3px 0%, 100% 0%, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0% 100%, 0% 3px)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                      />
                    </div>
                    <p className="text-[9px] text-gray-500 mt-1.5 font-mono">// {motivationalMsg(pct).toUpperCase()}</p>
                  </div>

                  {/* Stats HUD Grid */}
                  <div className="grid grid-cols-3 gap-2.5 mb-5">
                    {[
                      { label: 'Deepworks', value: selectedProject.totalDeepworks, icon: '🎯' },
                      { label: 'Sesiones', value: stats.sessions, icon: '📅' },
                      { label: 'Horas loggeadas', value: `${stats.hours}h`, icon: '⏱️' },
                    ].map(({ label, value, icon }) => (
                      <div key={label} className="border border-orange-500/10 bg-neutral-950 p-2.5 text-center flex flex-col justify-between"
                        style={{ clipPath: 'polygon(6px 0%, 100% 0%, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0% 100%, 0% 6px)' }}>
                        <p className="text-lg leading-none">{icon}</p>
                        <p className="text-base font-bold text-orange-400 mt-1 font-mono">{value}</p>
                        <p className="text-[8px] font-mono text-gray-500 uppercase mt-0.5 tracking-tighter leading-none">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Change status */}
                  <div className="mb-5">
                    <p className="font-mono text-[8px] text-gray-500 uppercase tracking-widest mb-2">// ACTUALIZAR_ESTADO</p>
                    <div className="flex gap-2">
                      {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                        <button
                          key={key}
                          onClick={() => {
                            onUpdateProject({ ...selectedProject, status: key })
                            setSelectedProject(prev => ({ ...prev, status: key }))
                          }}
                          className="flex-1 py-2 text-[10px] font-bold uppercase transition-all border cursor-pointer"
                          style={{
                            background: status === key ? 'rgba(249,115,22,0.1)' : 'rgba(0,0,0,0.5)',
                            border: status === key ? '1px solid #f97316' : '1px solid rgba(249,115,22,0.15)',
                            color: status === key ? '#f97316' : '#6b7280',
                            clipPath: 'polygon(6px 0%, 100% 0%, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0% 100%, 0% 6px)'
                          }}
                        >
                          {cfg.label.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recent sessions */}
                  {stats.entries.length > 0 && (
                    <div className="mb-5">
                      <p className="font-mono text-[8px] text-gray-500 uppercase tracking-widest mb-2">// LOG_DE_SESIONES</p>
                      <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                        {stats.entries.slice(-4).reverse().map(entry => (
                          <div key={entry.id} className="flex items-center justify-between border border-orange-500/5 bg-neutral-950/60 px-3 py-2 font-mono text-[10px]"
                            style={{ clipPath: 'polygon(4px 0%, 100% 0%, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0% 100%, 0% 4px)' }}>
                            <div>
                              <p className="font-bold text-gray-300">{new Date(entry.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</p>
                              <p className="text-[9px] text-gray-500">{Math.floor(entry.duration / 60)} MIN</p>
                            </div>
                            <span className="text-orange-400 font-extrabold">{entry.deepworksCompleted} DW</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    {!isActive && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { onSelectProject(selectedProject); setSelectedProject(null) }}
                        className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-black font-extrabold text-xs tracking-wider uppercase cursor-pointer"
                        style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}
                      >
                        Activar Proyecto
                      </motion.button>
                    )}
                    {projects.length > 1 && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          if (confirm(`¿Eliminar "${selectedProject.name}"?`)) {
                            onDeleteProject(selectedProject.id)
                            setSelectedProject(null)
                          }
                        }}
                        className="px-4 py-3 bg-red-950/20 border border-red-500/25 hover:border-red-500/60 text-red-400 transition-colors cursor-pointer"
                        style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )
        })()}
      </AnimatePresence>

      {/* ── NEW PROJECT WIZARD MODAL ── */}
      <AnimatePresence>
        {showNewProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 z-50 flex items-end justify-center px-4"
            onClick={() => setShowNewProject(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto border-t border-l border-r border-orange-500/25 relative"
              style={{
                background: '#080808',
                clipPath: 'polygon(16px 0%, calc(100% - 16px) 0%, 100% 16px, 100% 100%, 0% 100%, 0% 16px)'
              }}
            >
              {/* Modal Scanline Overlay */}
              <div className="hud-scanline" />

              <div className="p-5 relative z-10">
                <div className="flex items-center justify-between mb-5 border-b border-orange-500/10 pb-3">
                  <div>
                    <h3 className="text-base font-bold uppercase tracking-wider text-white">
                      {step === 'template' ? 'Plantillas de Misión'
                        : step === 'confirm' ? 'Confirmar Enfoque'
                          : step === 'duration' ? 'Objetivos Temporales'
                            : 'Misión Personalizada'}
                    </h3>
                    <span className="font-mono text-[7px] text-gray-500 tracking-widest leading-none">
                      WIZARD_STAGE: {step.toUpperCase()}
                    </span>
                  </div>
                  <button onClick={() => setShowNewProject(false)}
                    className="w-7 h-7 bg-black/75 border border-orange-500/30 text-orange-400 hover:text-white flex items-center justify-center cursor-pointer"
                    style={{ clipPath: 'polygon(4px 0%, 100% 0%, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0% 100%, 0% 4px)' }}>
                    <X size={14} />
                  </button>
                </div>

                {/* STEP 1: template list — activity categories */}
                {step === 'template' && (
                  <div className="space-y-4">

                    {/* Principales */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-2 font-mono">
                        <span className="w-1.5 h-1.5 bg-red-500" />
                        <p className="text-[9px] font-extrabold text-red-500 uppercase tracking-widest">Misiones Principales (Core)</p>
                      </div>
                      <div className="space-y-1.5">
                        {ACTIVITY_TEMPLATES.principales.map((tpl, i) => (
                          <button
                            key={i}
                            onClick={() => handleSelectTemplate(tpl)}
                            className="w-full flex items-center gap-3 p-3 bg-neutral-950 border border-orange-500/10 hover:border-orange-500/40 transition-all text-left cursor-pointer"
                            style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}
                          >
                            {tpl.gif ? (
                              <div className="w-10 h-10 overflow-hidden flex-shrink-0 border border-orange-500/10">
                                <img src={tpl.gif} alt={tpl.name} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 bg-[#0d0d0d] border border-orange-500/10 flex items-center justify-center text-xl flex-shrink-0">{tpl.emoji}</div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm text-gray-200 uppercase tracking-wide">{tpl.name}</p>
                              <p className="text-[9px] text-gray-500 font-mono truncate">{tpl.focusExample.toUpperCase()}</p>
                            </div>
                            <span className="font-mono text-[8px] font-bold px-1.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 flex-shrink-0">CORE</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Complementarias */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-2 font-mono">
                        <span className="w-1.5 h-1.5 bg-yellow-500" />
                        <p className="text-[9px] font-extrabold text-yellow-500 uppercase tracking-widest">Actividades Secundarias (Plus)</p>
                      </div>
                      <div className="space-y-1.5">
                        {ACTIVITY_TEMPLATES.complementarias.map((tpl, i) => (
                          <button
                            key={i}
                            onClick={() => handleSelectTemplate(tpl)}
                            className="w-full flex items-center gap-3 p-3 bg-neutral-950 border border-orange-500/10 hover:border-orange-500/40 transition-all text-left cursor-pointer"
                            style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}
                          >
                            {tpl.gif ? (
                              <div className="w-10 h-10 overflow-hidden flex-shrink-0 border border-orange-500/10">
                                <img src={tpl.gif} alt={tpl.name} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 bg-[#0d0d0d] border border-orange-500/10 flex items-center justify-center text-xl flex-shrink-0">{tpl.emoji}</div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm text-gray-200 uppercase tracking-wide">{tpl.name}</p>
                              <p className="text-[9px] text-gray-500 font-mono truncate">{tpl.focusExample.toUpperCase()}</p>
                            </div>
                            <span className="font-mono text-[8px] font-bold px-1.5 py-0.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 flex-shrink-0">PLUS</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom */}
                    <div>
                      <div className="space-y-1.5 font-mono">
                        {ACTIVITY_TEMPLATES.custom.map((tpl, i) => (
                          <button
                            key={i}
                            onClick={() => handleSelectTemplate(tpl)}
                            className="w-full flex items-center gap-3 p-3 bg-neutral-950 border border-dashed border-orange-500/20 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all text-left cursor-pointer"
                            style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}
                          >
                            <div className="w-10 h-10 bg-[#0d0d0d] border border-orange-500/5 flex items-center justify-center text-xl flex-shrink-0">{tpl.emoji}</div>
                            <div className="flex-1">
                              <p className="text-xs text-gray-400 uppercase tracking-widest">{tpl.name.toUpperCase()}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* STEP 2: confirm template */}
                {step === 'confirm' && selectedTemplate && (
                  <div>
                    {selectedTemplate.gif && (
                      <div className="h-40 overflow-hidden mb-4 border border-orange-500/10"
                        style={{ clipPath: 'polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)' }}>
                        <img src={selectedTemplate.gif} alt={selectedTemplate.name} className="w-full h-full object-cover opacity-85" />
                      </div>
                    )}
                    <p className="text-base font-bold uppercase tracking-wider text-orange-400 mb-1">{selectedTemplate.emoji} {selectedTemplate.name.toUpperCase()}</p>
                    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-3">// ¿EN QUÉ SUBTAREA O ÁREA DE TRABAJO TE ENFOCARÁS?</p>
                    <textarea
                      value={projectFocus}
                      onChange={e => setProjectFocus(e.target.value)}
                      placeholder="Ej: Completar el módulo de API, practicar vocabulario diario, mejorar técnica..."
                      rows={3}
                      className="w-full p-3 bg-neutral-950 border border-orange-500/20 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 text-sm resize-none mb-4 font-sans"
                      style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}
                      autoFocus
                    />
                    <div className="flex gap-3">
                      <button onClick={() => setStep('template')}
                        className="flex-1 py-3 bg-neutral-950 border border-orange-500/20 text-gray-400 hover:text-white text-xs uppercase font-extrabold cursor-pointer"
                        style={{ clipPath: 'polygon(6px 0%, 100% 0%, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0% 100%, 0% 6px)' }}>
                        Atrás
                      </button>
                      <button onClick={() => setStep('duration')}
                        className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-black text-xs uppercase font-extrabold cursor-pointer"
                        style={{ clipPath: 'polygon(6px 0%, 100% 0%, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0% 100%, 0% 6px)' }}>
                        Continuar
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: duration & hours goal */}
                {step === 'duration' && (
                  <div>
                    <div className="mb-5">
                      <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-1">// PLAZO DE EJECUCIÓN (DÍAS)</p>
                      <p className="text-[9px] text-gray-500 font-mono mb-2">SELECCIONA EL TIEMPO ESTIMADO PARA LA META</p>
                      <div className="flex gap-1.5 mb-2.5 flex-wrap">
                        {[1, 3, 7, 14, 30].map(d => (
                          <button
                            key={d}
                            onClick={() => setPlannedDays(d)}
                            className="px-3 py-1.5 text-xs font-bold uppercase transition-all border cursor-pointer"
                            style={{
                              background: plannedDays === d ? 'rgba(249,115,22,0.1)' : 'rgba(0,0,0,0.5)',
                              border: plannedDays === d ? '1px solid #f97316' : '1px solid rgba(249,115,22,0.15)',
                              color: plannedDays === d ? '#f97316' : '#6b7280',
                              clipPath: 'polygon(4px 0%, 100% 0%, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0% 100%, 0% 4px)'
                            }}
                          >
                            {d === 1 ? '1 DÍA' : d === 7 ? '1 SEMANA' : d === 14 ? '2 SEMANAS' : d === 30 ? '1 MES' : `${d} DÍAS`}
                          </button>
                        ))}
                      </div>
                      <input
                        type="number"
                        value={plannedDays}
                        onChange={e => setPlannedDays(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full p-2.5 bg-neutral-950 border border-orange-500/20 text-white focus:outline-none focus:border-orange-500 text-xs font-mono"
                        style={{ clipPath: 'polygon(4px 0%, 100% 0%, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0% 100%, 0% 4px)' }}
                        placeholder="DIAS PERSONALIZADOS"
                        min={1}
                      />
                    </div>

                    <div className="mb-5">
                      <p className="text-xs font-mono text-orange-400 uppercase tracking-widest mb-1">// CUOTA DE TRABAJO (HORAS METAS)</p>
                      <p className="text-[9px] text-gray-500 font-mono mb-2">HORAS TOTALES DE ENFOQUE A LOGRAR</p>
                      <div className="flex gap-1.5 mb-2.5 flex-wrap">
                        {[5, 10, 20, 40, 80].map(h => (
                          <button
                            key={h}
                            onClick={() => setHoursGoal(h)}
                            className="px-3 py-1.5 text-xs font-bold uppercase transition-all border cursor-pointer"
                            style={{
                              background: hoursGoal === h ? 'rgba(249,115,22,0.1)' : 'rgba(0,0,0,0.5)',
                              border: hoursGoal === h ? '1px solid #f97316' : '1px solid rgba(249,115,22,0.15)',
                              color: hoursGoal === h ? '#f97316' : '#6b7280',
                              clipPath: 'polygon(4px 0%, 100% 0%, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0% 100%, 0% 4px)'
                            }}
                          >
                            {h}H
                          </button>
                        ))}
                      </div>
                      <input
                        type="number"
                        value={hoursGoal}
                        onChange={e => setHoursGoal(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full p-2.5 bg-neutral-950 border border-orange-500/20 text-white focus:outline-none focus:border-orange-500 text-xs font-mono"
                        style={{ clipPath: 'polygon(4px 0%, 100% 0%, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0% 100%, 0% 4px)' }}
                        placeholder="HORAS PERSONALIZADAS"
                        min={1}
                      />
                    </div>

                    <div className="flex gap-3">
                      <button onClick={() => setStep(selectedTemplate?.name === 'Proyecto personalizado' ? 'custom' : 'confirm')}
                        className="flex-1 py-3 bg-neutral-950 border border-orange-500/20 text-gray-400 hover:text-white text-xs uppercase font-extrabold cursor-pointer"
                        style={{ clipPath: 'polygon(6px 0%, 100% 0%, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0% 100%, 0% 6px)' }}>
                        Atrás
                      </button>
                      <button onClick={handleCreate}
                        className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-black text-xs uppercase font-extrabold cursor-pointer"
                        style={{ clipPath: 'polygon(6px 0%, 100% 0%, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0% 100%, 0% 6px)' }}>
                        CREAR PROYECTO
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP: custom */}
                {step === 'custom' && (
                  <div>
                    <div className="mb-4">
                      <p className="text-[10px] font-mono text-orange-400 uppercase tracking-widest mb-1.5">// SELECCIONA ICONO</p>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {emojis.map(e => (
                          <button key={e} onClick={() => setCustomEmoji(e)}
                            className="text-xl p-1.5 bg-[#0d0d0d] border border-orange-500/10 hover:border-orange-500/40 transition-all cursor-pointer"
                            style={{
                              background: customEmoji === e ? 'rgba(249,115,22,0.1)' : 'rgba(0,0,0,0.5)',
                              border: customEmoji === e ? '1px solid #f97316' : '1px solid rgba(249,115,22,0.15)',
                              clipPath: 'polygon(4px 0%, 100% 0%, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0% 100%, 0% 4px)'
                            }}>
                            {e}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] font-mono text-orange-400 uppercase tracking-widest mb-1.5">// NOMBRE DEL PROYECTO</p>
                      <input
                        type="text"
                        value={customName}
                        onChange={e => setCustomName(e.target.value)}
                        placeholder="Ej: DUEL_TACTICAL || DESARROLLO_WEB"
                        className="w-full p-3 bg-neutral-950 border border-orange-500/20 text-white placeholder-gray-650 focus:outline-none focus:border-orange-500 mb-4 text-xs font-mono"
                        style={{ clipPath: 'polygon(6px 0%, 100% 0%, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0% 100%, 0% 6px)' }}
                        autoFocus
                      />
                      <p className="text-[10px] font-mono text-orange-400 uppercase tracking-widest mb-1.5">// ENLACE DE IMAGEN/GIF (OPCIONAL)</p>
                      <input
                        type="text"
                        value={customGif}
                        onChange={e => setCustomGif(e.target.value)}
                        placeholder="https://media.giphy.com/..."
                        className="w-full p-3 bg-neutral-950 border border-orange-500/20 text-white placeholder-gray-650 focus:outline-none focus:border-orange-500 text-xs font-mono"
                        style={{ clipPath: 'polygon(6px 0%, 100% 0%, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0% 100%, 0% 6px)' }}
                      />
                      {customGif && (
                        <div className="h-28 overflow-hidden mt-3 border border-orange-500/10"
                          style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}>
                          <img src={customGif} alt="preview" className="w-full h-full object-cover opacity-80" />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setStep('template')}
                        className="flex-1 py-3 bg-neutral-950 border border-orange-500/20 text-gray-400 hover:text-white text-xs uppercase font-extrabold cursor-pointer"
                        style={{ clipPath: 'polygon(6px 0%, 100% 0%, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0% 100%, 0% 6px)' }}>
                        Atrás
                      </button>
                      <button onClick={() => setStep('duration')} disabled={!customName.trim()}
                        className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-black text-xs uppercase font-extrabold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ clipPath: 'polygon(6px 0%, 100% 0%, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0% 100%, 0% 6px)' }}>
                        Continuar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}


// HISTORY SCREEN
function HistoryScreen({ history, projects, onImport, onDeleteEntry }) {
  const fileInputRef = useRef(null)

  const groupedHistory = history.reduce((acc, entry) => {
    const date = new Date(entry.date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    if (!acc[date]) acc[date] = []
    acc[date].push(entry)
    return acc
  }, {})

  const moodEmojis = {
    bajo: '😴',
    neutro: '😐',
    ready: '🔥',
    flow: '🌀'
  }

  const downloadEntry = (entry) => {
    const dataStr = JSON.stringify(entry, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `session-${entry.projectName}-${new Date(entry.date).toISOString().split('T')[0]}.json`
    link.click()
  }

  const downloadAllHistory = () => {
    // Exportamos un objeto completo con { history, projects } para backup total
    const fullBackup = {
      timestamp: new Date().toISOString(),
      history: history,
      projects: projects || []
    }

    const dataStr = JSON.stringify(fullBackup, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `deepwork-backup-${new Date().toISOString().split('T')[0]}.json`
    link.click()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-full pt-20 px-8 pb-8"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Historial</h1>
          <div className="flex gap-2">
            <button
              onClick={downloadAllHistory}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-gold-500 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
            >
              📤 Exportar todo
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={onImport}
              className="hidden"
              accept=".json"
            />
            <button
              onClick={() => fileInputRef.current.click()}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-gold-500 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
            >
              📥 Importar JSON
            </button>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No hay sesiones registradas aún</p>
            <p className="text-gray-500 text-sm mt-2">Completa tu primer deepwork para verlo aquí </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedHistory).map(([date, entries]) => (
              <div key={date}>
                <h3 className="text-lg font-semibold text-gray-400 mb-4">{date}</h3>
                <div className="space-y-4">
                  {entries.map(entry => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-neutral-850/50 p-6 rounded-2xl"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{moodEmojis[entry.mood]}</span>
                          <div>
                            <h4 className="font-semibold text-lg">{entry.projectName}</h4>
                            <p className="text-sm text-gray-400">
                              {new Date(entry.date).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <p className="text-2xl font-bold text-gold-500">
                            {entry.deepworksCompleted}/{entry.deepworksPlanned}
                          </p>
                          <p className="text-xs text-gray-400 mb-2">deepworks</p>
                          <div className="flex gap-3">
                            <button
                              onClick={() => downloadEntry(entry)}
                              className="text-xs text-neutral-500 hover:text-gold-500 transition-colors"
                              title="Descargar como JSON"
                            >
                              💾 JSON
                            </button>
                            <button
                              onClick={() => onDeleteEntry(entry.id)}
                              className="text-xs text-red-500/70 hover:text-red-500 transition-colors"
                              title="Eliminar sesión"
                            >
                              🗑️ Eliminar
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Preguntas trabajadas</p>
                          <p className="font-medium">{entry.questions?.length || 0}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Duración</p>
                          <p className="font-medium">{Math.floor(entry.duration / 60)}min</p>
                        </div>
                      </div>

                      {entry.questions && entry.questions.length > 0 && (
                        <details className="mt-4">
                          <summary className="cursor-pointer text-sm text-gold-500 hover:text-gold-400">
                            Ver preguntas
                          </summary>
                          <ul className="mt-2 space-y-1 text-sm text-gray-300 ml-4">
                            {entry.questions.map((q, i) => (
                              <li key={i}>• {q}</li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// METRICS SCREEN
function MetricsScreen({ history, projects, currentRank, currentLevel, xp, nextLevelXP, progressToNext, getNextRank }) {
  const [activeTab, setActiveTab] = useState('weekly')

  const nextRank = getNextRank ? getNextRank(currentLevel) : null;
  const xpNeededForNextRank = nextRank ? (10 * Math.pow(nextRank.min - 1, 2)) - xp : 0;

  // ── Streak ──────────────────────────────────────────────────────
  const calcStreak = () => {
    if (history.length === 0) return { current: 0, best: 0 }
    const dates = [...new Set(history.map(e => getLocalYMD(e.date)))].sort((a, b) => b.localeCompare(a))
    const today = getLocalYMD()
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
    const yStr = getLocalYMD(yesterday)
    let current = 0
    if (dates[0] === today || dates[0] === yStr) {
      current = 1
      for (let i = 1; i < dates.length; i++) {
        const diff = (new Date(dates[i - 1]) - new Date(dates[i])) / 86400000
        if (diff === 1) current++; else break
      }
    }
    let best = 0, streak = 1
    for (let i = 1; i < dates.length; i++) {
      const diff = (new Date(dates[i - 1]) - new Date(dates[i])) / 86400000
      if (diff === 1) streak++; else { best = Math.max(best, streak); streak = 1 }
    }
    return { current, best: Math.max(best, streak, current) }
  }
  const { current: currentStreak, best: bestStreak } = calcStreak()

  // ── Chart data by tab ────────────────────────────────────────────
  const getDays = (n) => Array.from({ length: n }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (n - 1 - i))
    return getLocalYMD(d)
  })
  const getHours = () => Array.from({ length: 24 }, (_, i) => {
    const d = new Date(); d.setHours(d.getHours() - (23 - i))
    return getLocalYMDH(d)
  })

  const tabConfig = {
    daily: {
      data: getHours(),
      match: e => getLocalYMDH(e.date),
      labelFn: (d, i) => i === 0 ? 'Hoy' : ''
    },
    weekly: {
      data: getDays(7),
      match: e => getLocalYMD(e.date),
      labelFn: d => new Date(d + 'T12:00').toLocaleDateString('es-ES', { weekday: 'short' })
    },
    monthly: {
      data: getDays(30),
      match: e => getLocalYMD(e.date),
      labelFn: (d, i) => i % 5 === 0 ? new Date(d + 'T12:00').getDate() : ''
    }
  }

  const tab = tabConfig[activeTab]
  const chartData = tab.data.map((timeKey, i) => {
    const entries = history.filter(e => tab.match(e) === timeKey)
    return {
      label: tab.labelFn(timeKey, i),
      value: entries.reduce((s, e) => s + (e.duration || 0) / 60, 0)
    }
  })
  const maxValue = Math.max(...chartData.map(d => d.value), 1)

  // ── Key metrics ──────────────────────────────────────────────────
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const byDay = Array(7).fill(0)
  history.forEach(e => { byDay[new Date(e.date).getDay()] += 1 })
  const mostProductiveDay = history.length ? dayNames[byDay.indexOf(Math.max(...byDay))] : '—'
  const filledDays = byDay.filter(v => v > 0)
  const leastProductiveDay = history.length && filledDays.length ? dayNames[byDay.indexOf(Math.min(...filledDays))] : '—'
  const byHour = Array(24).fill(0)
  history.forEach(e => { byHour[new Date(e.date).getHours()] += 1 })
  const peakHour = byHour.indexOf(Math.max(...byHour))
  const mostActiveTime = history.length ? (peakHour < 12 ? 'Mañana' : peakHour < 18 ? 'Tarde' : 'Noche') : '—'
  const totalMin = history.reduce((s, e) => s + e.duration, 0) / 60
  const uniqueDays = new Set(history.map(e => getLocalYMD(e.date))).size
  const avgMin = uniqueDays > 0 ? Math.round(totalMin / uniqueDays) : 0
  const avgFocus = history.length ? `${Math.floor(avgMin / 60)}h ${avgMin % 60}m` : '—'

  // ── Activity Calendar ───────────────────────────────────────────
  const WEEKS_TO_SHOW = 20;
  const todayNum = new Date();
  const historyMap = history.reduce((acc, entry) => {
    const d = getLocalYMD(entry.date);
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});
  const maxDWActivity = Math.max(...Object.values(historyMap), 1);

  const activityMatrix = Array(WEEKS_TO_SHOW).fill(null).map(() => Array(7).fill(null));
  const currentDayOfWk = todayNum.getDay() === 0 ? 6 : todayNum.getDay() - 1;
  let dateCursor = new Date(todayNum);
  dateCursor.setHours(23, 59, 59, 999);

  for (let col = WEEKS_TO_SHOW - 1; col >= 0; col--) {
    for (let row = 6; row >= 0; row--) {
      if (col === WEEKS_TO_SHOW - 1 && row > currentDayOfWk) {
        continue;
      }
      const dateString = getLocalYMD(dateCursor);
      const count = historyMap[dateString] || 0;
      let level = 0;
      if (count > 0) {
        const ratio = count / maxDWActivity;
        if (ratio <= 0.3) level = 1;
        else if (ratio <= 0.6) level = 2;
        else if (ratio <= 0.8) level = 3;
        else level = 4;
      }
      activityMatrix[col][row] = { date: dateString, count, level };
      dateCursor.setDate(dateCursor.getDate() - 1);
    }
  }

  const getActivityColor = (level) => {
    switch (level) {
      case 1: return 'bg-orange-500/15 border border-orange-500/10';
      case 2: return 'bg-orange-500/35 border border-orange-500/20';
      case 3: return 'bg-orange-500/65 border border-orange-500/40';
      case 4: return 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)] border border-orange-600';
      default: return 'bg-neutral-900 border border-neutral-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-full pt-20 pb-8 px-4 sm:px-6 relative text-white"
      style={{ background: '#080808', fontFamily: "'Rajdhani', sans-serif" }}
    >
      {/* Scanline overlay */}
      <div className="hud-scanline" />

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(249,115,22,0.03) 0%, transparent 70%)'
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
                className="h-full bg-gradient-to-r from-orange-500 to-red-500"
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

        {/* STREAK - Styled as HudPanel */}
        <HudPanel title="MÉTRICAS_DE_RACHA" mod="STK-R2" id="0002-S" dotStatus="active" className="w-full">
          <div className="grid grid-cols-2 gap-4 py-1">
            {[
              { icon: '🔥', label: 'Racha actual', value: currentStreak, unit: 'días' },
              { icon: '🏆', label: 'Mejor racha', value: bestStreak, unit: 'días' }
            ].map(({ icon, label, value, unit }) => (
              <div key={label} className="flex items-center gap-3 p-2.5 bg-neutral-950 border border-orange-500/5"
                style={{ clipPath: 'polygon(6px 0%, 100% 0%, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0% 100%, 0% 6px)' }}>
                <span className="text-2xl">{icon}</span>
                <div>
                  <p className="text-[9px] font-mono text-gray-500 uppercase leading-none mb-1">{label}</p>
                  <p className="text-lg font-bold font-mono text-orange-400 leading-none">
                    {value} <span className="text-[10px] font-normal text-gray-500 uppercase">{unit}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </HudPanel>

        {/* TABS */}
        <div className="flex bg-neutral-950 border border-orange-500/10 p-1"
          style={{ clipPath: 'polygon(6px 0%, 100% 0%, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0% 100%, 0% 6px)' }}>
          {[
            ['daily', 'Diario'],
            ['weekly', 'Semanal'],
            ['monthly', 'Mensual']
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex-1 py-1.5 text-xs font-bold uppercase transition-all cursor-pointer"
              style={{
                background: activeTab === id ? 'rgba(249,115,22,0.1)' : 'transparent',
                border: activeTab === id ? '1px solid #f97316' : '1px solid transparent',
                color: activeTab === id ? '#f97316' : '#6b7280',
                clipPath: 'polygon(5px 0%, 100% 0%, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0% 100%, 0% 5px)'
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* KEY METRICS - Styled as HudPanel */}
        <HudPanel title="DIAGNÓSTICO_PRODUCTIVO" mod="DGN-P3" id="0003-D" dotStatus="active" className="w-full">
          <div className="grid grid-cols-2 gap-3 py-1">
            {[
              { label: 'Día más productivo', value: mostProductiveDay },
              { label: 'Día menos productivo', value: leastProductiveDay },
              { label: 'Hora más activa', value: mostActiveTime },
              { label: 'Focus diario promedio', value: avgFocus },
            ].map(({ label, value }) => (
              <div key={label} className="p-3 bg-[#0d0d0d] border border-orange-500/10 flex flex-col justify-between"
                style={{ clipPath: 'polygon(6px 0%, 100% 0%, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0% 100%, 0% 6px)', height: '62px' }}>
                <p className="text-[8px] font-mono text-gray-500 uppercase tracking-wider leading-none mb-1">// {label}</p>
                <p className="text-xs font-bold text-orange-400 uppercase tracking-wide leading-none">{value}</p>
              </div>
            ))}
          </div>
        </HudPanel>

        {/* ACTIVITY CALENDAR - Styled as HudPanel */}
        <HudPanel title="MATRIZ_DE_CONTRIBUCIONES" mod="MTR-C5" id="0004-M" dotStatus="active" className="w-full">
          <div className="flex justify-center w-full py-1">
            <div className="flex gap-2 max-w-full">
              <div className="flex flex-col justify-between text-[8px] text-gray-500 font-mono py-1 pr-1 z-10 sticky left-0 bg-transparent">
                <span>L</span>
                <span></span>
                <span>M</span>
                <span></span>
                <span>V</span>
                <span></span>
                <span>D</span>
              </div>
              <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-none">
                {activityMatrix.map((col, colIndex) => (
                  <div key={colIndex} className="flex flex-col gap-1">
                    {col.map((day, rowIndex) => {
                      if (!day) return <div key={rowIndex} className="w-3 h-3 rounded-none" />;
                      return (
                        <div
                          key={rowIndex}
                          className={`w-3 h-3 rounded-none ${getActivityColor(day.level)} transition-colors duration-200`}
                          title={`${day.count} deepworks el ${day.date}`}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </HudPanel>

        {/* FOCUS TIMELINE - Styled as HudPanel */}
        <HudPanel title="CRONOLOGÍA_DE_ENFOQUE" mod="CRN-F6" id="0005-C" dotStatus="active" className="w-full">
          {history.length === 0 ? (
            <p className="text-gray-500 text-xs text-center font-mono py-8 uppercase tracking-widest">// SIN REGISTROS DE ACTIVIDAD</p>
          ) : (
            <>
              {(() => {
                const svgW = 300, svgH = 80;
                const ptsRaw = chartData.map((d, i) => {
                  const x = chartData.length > 1 ? (i / (chartData.length - 1)) * svgW : svgW / 2;
                  const y = svgH - (d.value / maxValue) * (svgH - 10) - 2;
                  return { x, y };
                });
                const ptsString = ptsRaw.map(p => `${p.x},${p.y}`).join(' ');

                const firstX = ptsRaw[0]?.x || 0;
                const lastX = ptsRaw[ptsRaw.length - 1]?.x || svgW;
                const fillArea = `${firstX},${svgH} ${ptsString} ${lastX},${svgH}`;

                return (
                  <div className="relative py-1">
                    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" preserveAspectRatio="none" style={{ height: 90 }}>
                      <defs>
                        <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {/* Horizontal Grid Lines */}
                      {[0.25, 0.5, 0.75].map(f => (
                        <line key={f} x1="0" y1={svgH * f} x2={svgW} y2={svgH * f} stroke="rgba(249,115,22,0.15)" strokeWidth="0.5" strokeDasharray="3 3" />
                      ))}
                      {/* Filled Area */}
                      <polygon points={fillArea} fill="url(#focusGradient)" />
                      {/* Line */}
                      <polyline points={ptsString} fill="none" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                        style={{ filter: 'drop-shadow(0 0 4px rgba(249,115,22,0.6))' }} />
                    </svg>

                    {/* Labels aligned with their specific X positions */}
                    <div className="relative w-full h-4 mt-1">
                      {ptsRaw.map((p, i) => {
                        const label = chartData[i].label;
                        if (!label) return null;

                        const pct = (p.x / svgW) * 100;
                        return (
                          <span
                            key={i}
                            className="absolute text-[8px] font-mono text-gray-500 uppercase tracking-tighter transform -translate-x-1/2 whitespace-nowrap"
                            style={{ left: `${pct}%` }}
                          >
                            {label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </HudPanel>

        {/* PROJECT STATS - Styled as HudPanel */}
        <HudPanel title="RENDIMIENTO_POR_PROYECTO" mod="PRJ-R7" id="0006-P" dotStatus="active" className="w-full">
          <div className="space-y-3.5 py-1">
            {[...projects].sort((a, b) => b.totalDeepworks - a.totalDeepworks).map(project => {
              const maxP = Math.max(...projects.map(p => p.totalDeepworks), 1)
              return (
                <div key={project.id} className="flex items-center gap-3">
                  <span className="text-xl p-1 bg-neutral-950 border border-orange-500/10"
                    style={{ clipPath: 'polygon(4px 0%, 100% 0%, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0% 100%, 0% 4px)' }}>
                    {project.emoji}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1 font-mono text-[10px] uppercase">
                      <p className="font-bold text-gray-300 tracking-wide truncate max-w-[150px]">{project.name}</p>
                      <p className="font-bold text-orange-400">{project.totalDeepworks} dw</p>
                    </div>
                    <div className="w-full bg-neutral-950 border border-orange-500/10 h-2"
                      style={{ clipPath: 'polygon(2px 0%, 100% 0%, 100% calc(100% - 2px), calc(100% - 2px) 100%, 0% 100%, 0% 2px)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(project.totalDeepworks / maxP) * 100}%` }}
                        transition={{ duration: 0.6 }}
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-full"
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </HudPanel>
      </div>
    </motion.div>
  )
}

// ============= OBJECTIVE SCREEN =============
const LEARNING_PHASES = [
  {
    id: 'captura',
    label: 'Captura',
    emoji: '📖',
    desc: 'Lectura superficial → preguntas → apuntes',
    color: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
    activeColor: 'border-blue-500 bg-blue-500/20 text-blue-200',
  },
  {
    id: 'output',
    label: 'Output',
    emoji: '✍️',
    desc: 'Síntesis activa → explicar con tus palabras',
    color: 'border-orange-500/40 bg-orange-500/10 text-orange-300',
    activeColor: 'border-orange-500 bg-orange-500/20 text-orange-200',
  },
  {
    id: 'proceso',
    label: 'Proceso (Anki)',
    emoji: '🧠',
    desc: 'Flashcards → repaso espaciado',
    color: 'border-purple-500/40 bg-purple-500/10 text-purple-300',
    activeColor: 'border-purple-500 bg-purple-500/20 text-purple-200',
  },
]

function ObjectiveScreen({ onConfirm, projectName }) {
  const [objective, setObjective] = useState('')
  const [phase, setPhase] = useState(null)

  const canContinue = objective.trim().length > 0 && phase !== null

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '-100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 px-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-sm"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-xs text-gold-400 uppercase tracking-widest font-semibold mb-1">
            {projectName && `→ ${projectName}`}
          </p>
          <h2 className="text-3xl font-bold">Intención de sesión</h2>
          <p className="text-gray-400 text-sm mt-1">Define el objetivo antes de entrar en foco</p>
        </div>

        {/* Objective input */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">¿Qué vas a lograr?</p>
          <textarea
            autoFocus
            rows={3}
            value={objective}
            onChange={e => setObjective(e.target.value)}
            placeholder="Ej: Leer cap. 3 de redes y generar 10 preguntas clave…"
            className="w-full p-4 bg-neutral-800 border border-neutral-700 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-gold-500 text-sm resize-none transition-colors"
          />
        </div>

        {/* Learning phase */}
        <div className="mb-8">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Fase de aprendizaje</p>
          <div className="space-y-2">
            {LEARNING_PHASES.map(p => (
              <button
                key={p.id}
                onClick={() => setPhase(p.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${phase === p.id ? p.activeColor : p.color
                  }`}
              >
                <span className="text-2xl flex-shrink-0">{p.emoji}</span>
                <div>
                  <p className="font-semibold text-sm">{p.label}</p>
                  <p className="text-[11px] opacity-70">{p.desc}</p>
                </div>
                {phase === p.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto w-5 h-5 rounded-full bg-current flex items-center justify-center flex-shrink-0"
                  >
                    <Check size={11} className="text-neutral-900" />
                  </motion.div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Confirm */}
        <motion.button
          onClick={() => canContinue && onConfirm(objective.trim(), phase)}
          disabled={!canContinue}
          animate={canContinue ? { scale: [1, 1.02, 1] } : { scale: 1 }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${canContinue
              ? 'bg-gold-500 text-black hover:bg-gold-400 shadow-[0_0_20px_rgba(234,179,8,0.3)]'
              : 'bg-neutral-800 text-gray-600 cursor-not-allowed'
            }`}
        >
          {canContinue ? 'Entrar en foco →' : 'Define objetivo + fase'}
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

// Stats Card Component
function StatsCard({ icon, value, label, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-neutral-850/50 p-6 rounded-2xl"
    >
      <div className={`${color} mb-3`}>{icon}</div>
      <div className="text-4xl font-bold mb-1">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </motion.div>
  )
}


// ============= CALENDAR SCREEN =============

// Hábitos estáticos — los mismos todos los días
const STATIC_HOBBIES = [
  { id: 'h-1', label: 'Gym / Ejercicio', emoji: '🏋️' },
  { id: 'h-2', label: 'Leer 30 min', emoji: '📖' },
  { id: 'h-3', label: 'Meditación', emoji: '🧘' },
  { id: 'h-4', label: 'Proyecto personal', emoji: '💻' },
  { id: 'h-5', label: 'Guitarra', emoji: '🎸' },
  { id: 'h-6', label: 'Inglés 20 min', emoji: '🌐' },
]

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const DAY_NAMES_FULL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

function CalendarScreen({ history, projects }) {
  const todayStr = getLocalYMD()

  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [weekOffset, setWeekOffset] = useState(0) // 0=current week, -1=prev
  const [hobbyChecks, setHobbyChecks] = useLocalStorage('hobby_checks', {})

  // ── Build week (Mon-Sun) with offset ──
  const getWeekDays = (offset = 0) => {
    const base = new Date()
    base.setDate(base.getDate() + offset * 7)
    const day = base.getDay()
    const monday = new Date(base)
    monday.setDate(base.getDate() - (day === 0 ? 6 : day - 1))
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      return d
    })
  }
  const weekDays = getWeekDays(weekOffset)

  const weekLabel = (() => {
    const f = (d) => d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    return `${f(weekDays[0])} – ${f(weekDays[6])}`
  })()

  // ── Sessions of selected day ──
  const sessionsOfDay = (history || []).filter(entry => {
    return getLocalYMD(entry.date) === selectedDate
  })

  // ── Time grid: full 24h ──
  const HOUR_START = 0
  const HOUR_END = 24
  const TOTAL_HOURS = HOUR_END - HOUR_START
  const HOUR_HEIGHT_PX = 52 // px per hour

  const sessionToBlock = (entry) => {
    const endTime = new Date(entry.date)
    const durationMs = (entry.duration || 0) * 1000
    const startTime = new Date(endTime - durationMs)

    const startH = startTime.getHours() + startTime.getMinutes() / 60
    const endH = endTime.getHours() + endTime.getMinutes() / 60

    const top = Math.max(0, (startH - HOUR_START) * HOUR_HEIGHT_PX)
    const height = Math.max(20, (endH - startH) * HOUR_HEIGHT_PX)
    const project = (projects || []).find(p => p.id === entry.projectId)
    return { top, height, entry, project, startTime, endTime }
  }

  // ── Hobby toggle ──
  const toggleHobby = (hobbyId) => {
    const key = `${selectedDate}_${hobbyId}`
    setHobbyChecks(prev => ({ ...prev, [key]: !prev[key] }))
  }
  const isChecked = (hobbyId) => !!hobbyChecks[`${selectedDate}_${hobbyId}`]

  const selDate = new Date(selectedDate + 'T12:00:00')
  const selDayOfWeek = selDate.getDay()
  const doneCount = STATIC_HOBBIES.filter(h => isChecked(h.id)).length

  const fmt = (date) => date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

  const blocks = sessionsOfDay.map(sessionToBlock)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-full pt-20 pb-8"
    >
      {/* ── Title ── */}
      <div className="px-6 mb-5">
        <h1 className="text-4xl font-bold">Calendario</h1>
        <p className="text-sm text-gray-500 mt-1">
          {DAY_NAMES_FULL[selDayOfWeek]}, {selDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* ── Week nav ── */}
      <div className="flex items-center gap-3 px-6 mb-3">
        <button
          onClick={() => setWeekOffset(v => v - 1)}
          className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 transition-colors"
        >
          <ChevronDown size={16} className="rotate-90" />
        </button>
        <span className="flex-1 text-center text-sm font-medium text-gray-400">{weekLabel}</span>
        <button
          onClick={() => setWeekOffset(v => v + 1)}
          disabled={weekOffset >= 0}
          className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 transition-colors disabled:opacity-30"
        >
          <ChevronDown size={16} className="-rotate-90" />
        </button>
        {weekOffset !== 0 && (
          <button
            onClick={() => { setWeekOffset(0); setSelectedDate(todayStr) }}
            className="text-xs text-gold-400 hover:text-gold-300 transition-colors px-1"
          >
            Hoy
          </button>
        )}
      </div>

      {/* ── Day selector ── */}
      <div className="flex gap-2 px-6 mb-5 overflow-x-auto pb-1">
        {weekDays.map((d, i) => {
          const ds = getLocalYMD(d)
          const isToday = ds === todayStr
          const isSel = ds === selectedDate
          const hasSessions = (history || []).some(e => getLocalYMD(e.date) === ds)
          return (
            <button
              key={i}
              onClick={() => setSelectedDate(ds)}
              className={`flex-shrink-0 flex flex-col items-center px-3 py-2.5 rounded-2xl transition-all ${isSel
                ? 'bg-gold-500 text-black'
                : isToday
                  ? 'bg-neutral-700 text-white'
                  : 'bg-neutral-850 text-gray-400 hover:bg-neutral-800'
                }`}
            >
              <span className="text-[10px] font-medium uppercase tracking-wide">{DAY_NAMES[d.getDay()]}</span>
              <span className="text-lg font-bold">{d.getDate()}</span>
              {hasSessions && (
                <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSel ? 'bg-black/50' : 'bg-gold-500'}`} />
              )}
            </button>
          )
        })}
      </div>

      {/* ── Hábitos (estáticos, mismos cada día) ── */}
      <div className="mx-6 mb-5 bg-neutral-850/60 rounded-2xl p-4 border border-neutral-800">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-300">Hábitos del día</p>
          <span className="text-xs text-gold-400 font-medium">{doneCount}/{STATIC_HOBBIES.length} completados</span>
        </div>
        <div className="w-full bg-neutral-700 rounded-full h-1 mb-4">
          <motion.div
            animate={{ width: `${(doneCount / STATIC_HOBBIES.length) * 100}%` }}
            className="h-1 rounded-full bg-gold-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {STATIC_HOBBIES.map(hobby => (
            <button
              key={hobby.id}
              onClick={() => toggleHobby(hobby.id)}
              className={`flex items-center gap-2 p-2.5 rounded-xl transition-all text-left border ${isChecked(hobby.id)
                ? 'bg-gold-500/10 border-gold-500/30'
                : 'bg-neutral-800/50 border-neutral-700 hover:border-neutral-600'
                }`}
            >
              <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all ${isChecked(hobby.id) ? 'bg-gold-500' : 'border border-neutral-600'
                }`}>
                {isChecked(hobby.id) && <Check size={10} className="text-black" />}
              </div>
              <span className="text-base">{hobby.emoji}</span>
              <span className={`text-xs leading-tight ${isChecked(hobby.id) ? 'line-through text-gray-500' : 'text-gray-300'
                }`}>
                {hobby.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Time grid (always visible, full 0–24h) ── */}
      <div className="mx-6">
        <p className="text-sm font-semibold text-gray-300 mb-3">
          Sesiones del día
          {sessionsOfDay.length > 0 && (
            <span className="ml-2 text-xs text-gray-500 font-normal">
              {sessionsOfDay.length} sesión{sessionsOfDay.length !== 1 ? 'es' : ''} · {Math.round(sessionsOfDay.reduce((s, e) => s + (e.duration || 0), 0) / 60)} min
            </span>
          )}
        </p>
        <div
          className="relative rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden"
          style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT_PX}px` }}
        >
          {/* Hour lines + labels */}
          {Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 flex items-center"
              style={{ top: `${i * HOUR_HEIGHT_PX}px` }}
            >
              <span className="text-[9px] text-gray-700 w-10 text-right pr-2 flex-shrink-0 select-none">
                {i < 24 ? `${String(i).padStart(2, '0')}:00` : ''}
              </span>
              <div className={`flex-1 border-t ${i % 6 === 0 ? 'border-neutral-700' : 'border-neutral-800/60'}`} />
            </div>
          ))}

          {/* Current time indicator */}
          {selectedDate === todayStr && (() => {
            const now = new Date()
            const nowH = now.getHours() + now.getMinutes() / 60
            return (
              <div className="absolute left-10 right-0 flex items-center z-10" style={{ top: `${nowH * HOUR_HEIGHT_PX}px` }}>
                <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 flex-shrink-0" />
                <div className="flex-1 border-t border-red-500/60" />
              </div>
            )
          })()}

          {/* Session blocks */}
          {blocks.map(({ top, height, entry, project, startTime, endTime }, idx) => (
            <motion.div
              key={entry.id || idx}
              initial={{ opacity: 0, scaleY: 0.8 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ delay: idx * 0.04 }}
              className="absolute left-11 right-2 rounded-xl px-3 py-1.5 overflow-hidden z-20"
              style={{
                top: `${top}px`,
                height: `${height}px`,
                background: 'linear-gradient(135deg, rgba(234,179,8,0.28), rgba(234,179,8,0.10))',
                border: '1px solid rgba(234,179,8,0.40)',
              }}
            >
              <div className="flex items-start gap-1.5 h-full">
                <span className="text-sm flex-shrink-0 mt-0.5">{project?.emoji || '🎯'}</span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-gold-400 truncate leading-tight">{entry.projectName}</p>
                  {height > 30 && (
                    <p className="text-[9px] text-gray-500">{fmt(startTime)} – {fmt(endTime)}</p>
                  )}
                  {height > 46 && (
                    <p className="text-[9px] text-gray-500">{Math.round((entry.duration || 0) / 60)} min · {entry.deepworksCompleted} DW</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Empty hint */}
          {blocks.length === 0 && (
            <div
              style={{ top: `${8 * HOUR_HEIGHT_PX}px`, height: `${3 * HOUR_HEIGHT_PX}px` }}
              className="absolute left-10 right-2 flex flex-col items-center justify-center gap-1 text-gray-700 pointer-events-none"
            >
              <CalendarDays size={24} className="opacity-25" />
              <p className="text-xs opacity-40">Sin sesiones</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default App


