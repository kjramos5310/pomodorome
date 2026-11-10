import { useState, useEffect, useReducer, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppData } from './hooks/useAppData'
import { useLocalStorage } from './hooks/useLocalStorage'
import { getLevel, getRank, getNextRank, getNextLevelXP, getProgressToNext, computeXP, SESSION_XP, ROULETTE_XP, PROJECT_DONE_XP } from './lib/xp'
import { mergeBackup } from './lib/importBackup'
import { nextPendingStep } from './lib/projectStats'
import { sessionReducer, initialSessionState, BREAK_DURATION } from './lib/sessionReducer'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import LevelUpModal from './components/LevelUpModal'
import WorldLevelToast from './components/WorldLevelToast'
import { themeFor, themeVars, worldOf, arcOf } from './lib/worlds'
import { WorldContext } from './lib/worldContext'
import HeroScreen from './screens/HeroScreen'
import MoodScreen from './screens/MoodScreen'
import WarmUpScreen from './screens/WarmUpScreen'
import ObjectiveScreen from './screens/ObjectiveScreen'
import DeepworkConfigScreen from './screens/DeepworkConfigScreen'
import QuestionsScreen from './screens/QuestionsScreen'
import FocusScreen from './screens/FocusScreen'
import BreakScreen from './screens/BreakScreen'
import SynthesisScreen from './screens/SynthesisScreen'
import EvidenceScreen from './screens/EvidenceScreen'
import CompletedScreen from './screens/CompletedScreen'
import ProjectsScreen from './screens/ProjectsScreen'
import HistoryScreen from './screens/HistoryScreen'
import MetricsScreen from './screens/MetricsScreen'
import CalendarScreen from './screens/CalendarScreen'
import RouletteScreen from './screens/RouletteScreen'
import BooksScreen from './screens/BooksScreen'
import IgnitionScreen from './screens/IgnitionScreen'
import NotesScreen from './screens/NotesScreen'
import './index.css'

// Fallback por si config.json no trae moodConfigs
const DEFAULT_MOOD_CONFIGS = {
  bajo: { suggested: 1, warmupTime: 120, focusTime: 900 },
  neutro: { suggested: 2, warmupTime: 120, focusTime: 1500 },
  ready: { suggested: 3, warmupTime: 120, focusTime: 1500 },
  flow: { suggested: 5, warmupTime: 120, focusTime: 2700 }
}

// Las sesiones de ruleta no cuentan como deepwork del proyecto
const isRouletteEntry = (entry) =>
  entry.type === 'roulette' || entry.notes?.startsWith('[INVESTIGACIÓN RULETA]')

const EMPTY_SESSION_DATA = { startTime: null, duration: 0, isActive: false, isPaused: false }

// ============= MAIN APP COMPONENT =============
function App() {
  // Cargar configuración desde JSON externo
  const { data: config, loading: configLoading, error: configError } = useAppData()
  const moodConfigs = config?.moodConfigs ?? DEFAULT_MOOD_CONFIGS

  // Estado del flujo DeepWork (ver lib/sessionReducer.js)
  const [session, dispatch] = useReducer(sessionReducer, initialSessionState)
  const {
    screen, mood, focusTime, deepworkCount, currentDeepwork, questions, currentQuestionIndex,
    completedQuestions, logs, synthesisData, sessionObjective, learningPhase
  } = session

  // Datos persistidos en localStorage
  const [history, setHistory] = useLocalStorage('deepwork_history', [])
  const [projects, setProjects] = useLocalStorage('deepwork_projects', [])
  const [currentProject, setCurrentProject] = useLocalStorage('dw_current_project', null)
  const [sessionData, setSessionData] = useLocalStorage('deepwork_session', EMPTY_SESSION_DATA)
  const [dailyGoal, setDailyGoal] = useLocalStorage('deepwork_daily_goal', 4) // Meta diaria flexible (default 4h para TDAH)
  const [lastLevel, setLastLevel] = useLocalStorage('deepwork_last_level', 1)

  // Estado de UI / navegación
  const [showSidebar, setShowSidebar] = useState(false)
  // 'projects' | 'history' | 'metrics' | 'calendar' | 'roulette' | 'books' | 'ignition' | null
  // Si quedó un ciclo Chispa → Motor a medias (recarga, cierre de pestaña), volver directo a él
  const [navigationScreen, setNavigationScreen] = useState(() => {
    try {
      const ig = JSON.parse(localStorage.getItem('ignition_state'))
      return ig && ['chispa', 'embrague', 'motor', 'cierre'].includes(ig.phase) ? 'ignition' : null
    } catch {
      return null
    }
  })
  const [showProjectSelector, setShowProjectSelector] = useState(false)
  const [showLevelUp, setShowLevelUp] = useState(false)

  // Gamificación: la XP se deriva siempre del historial + proyectos terminados (ver lib/xp.js)
  const xp = computeXP(history, projects)
  // ============= MUNDO DEL PROYECTO ACTIVO =============
  // El tema (colores, fondo, atmósfera) sigue al mundo del proyecto activo y
  // evoluciona con sus horas acumuladas. Se recalcula al cambiar de proyecto o al guardar sesiones.
  const activeProject = projects.find(p => p.id === currentProject?.id) || currentProject
  const theme = useMemo(() => themeFor(activeProject, history), [activeProject, history])
  useEffect(() => {
    const root = document.documentElement
    Object.entries(themeVars(theme)).forEach(([k, v]) => root.style.setProperty(k, v))
    root.dataset.world = theme.world.id
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.bg)
  }, [theme])

  // Aviso cuando el mundo de un proyecto sube de nivel (los niveles nunca se pierden)
  const [worldLevels, setWorldLevels] = useLocalStorage('world_levels', {})
  const [worldLevelUp, setWorldLevelUp] = useState(null)
  useEffect(() => {
    if (!activeProject?.id) return
    const seen = worldLevels[activeProject.id]
    if (seen === undefined || theme.level > seen) {
      // La primera vez solo se registra (sin aviso), para no felicitar por horas ya hechas
      if (seen !== undefined) setWorldLevelUp({ world: theme.world, level: theme.level, name: theme.levelName })
      setWorldLevels(prev => ({ ...prev, [activeProject.id]: Math.max(theme.level, prev[activeProject.id] ?? 0) }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProject?.id, theme.level])

  const currentLevel = getLevel(xp)
  const currentRank = getRank(currentLevel)
  const nextLevelXP = getNextLevelXP(currentLevel)
  const progressToNext = getProgressToNext(xp, currentLevel)

  // Inicializar proyectos desde config.json solo si localStorage está vacío
  useEffect(() => {
    if (config && projects.length === 0) {
      setProjects(config.initialProjects)
      setCurrentProject(config.initialProjects[0])
    }
  }, [config, projects, setCurrentProject, setProjects])

  // Detectar Level Up
  useEffect(() => {
    if (currentLevel > lastLevel) {
      setShowLevelUp(true)
      setLastLevel(currentLevel)
    }
  }, [currentLevel, lastLevel, setLastLevel])

  // ============= LOGS =============
  const addLog = (eventType, data) => {
    const entry = {
      timestamp: new Date().toISOString(),
      event_type: eventType,
      data: data
    }
    dispatch({ type: 'LOG', entry })
    console.log('Log added:', entry)
  }

  const exportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `deepwork-logs-${new Date().toISOString().split('T')[0]}.json`
    link.click()
  }

  // ============= FLUJO DE SESIÓN =============
  const quickStart = () => {
    addLog('quick_start', { timestamp: new Date().toISOString() })
    dispatch({ type: 'QUICK_START' })
  }

  // Manejar enrutamiento desde PWA Shortcuts (Query params)
  useEffect(() => {
    if (!config) return

    const params = new URLSearchParams(window.location.search)
    const screenParam = params.get('screen')
    const startParam = params.get('start')

    if (screenParam) {
      if (['projects', 'history', 'metrics', 'books', 'ignition', 'notes'].includes(screenParam)) {
        setNavigationScreen(screenParam)
      }
    } else if (startParam === 'true') {
      quickStart()
    }

    // Limpiar los query params del navegador para evitar bucles en F5
    if (screenParam || startParam) {
      window.history.replaceState({}, document.title, window.location.pathname)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config])

  // Guardar bloque completado al historial
  const saveToHistory = (evidence) => {
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
      xpGained: SESSION_XP,
      questions: questions,
      synthesis: synthesisData,
      evidence: evidence,
      inbox: sessionData.inboxItems || [],   // inbox de distracciones del foco
      sessionObjective: sessionObjective,
      learningPhase: learningPhase,
      world: worldOf(activeProject).id,   // el título "Verbo || Arco" se conserva aunque cambies de mundo
      arc: arcOf(activeProject),
    }
    setHistory(prev => [historyEntry, ...prev])

    // Actualizar total de deepworks del proyecto
    setProjects(prev => prev.map(p =>
      p.id === currentProject.id
        ? { ...p, totalDeepworks: p.totalDeepworks + 1 }
        : p
    ))
  }

  // ============= HISTORIAL =============
  // Importar logs
  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result)

        const result = mergeBackup(history, projects, importedData)
        if (!result) {
          alert('No se encontraron datos válidos en el archivo.')
          return
        }
        setHistory(result.history)
        setProjects(result.projects)
        const { newEntriesCount, newProjectsCount } = result

        alert(`Importación completada:\n- ${newEntriesCount} sesiones añadidas\n- ${newProjectsCount} proyectos sincronizados`)
      } catch (err) {
        console.error('Error importando:', err)
        alert('Error al leer el archivo JSON')
      }
    }
    reader.readAsText(file)
  }

  // Eliminar entrada del historial
  const handleDeleteHistoryEntry = (entryId) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta sesión? Se restará el progreso del proyecto y de la experiencia (XP).")) {
      return
    }

    const entryToDelete = history.find(e => e.id === entryId)
    if (!entryToDelete) return

    setHistory(prev => prev.filter(e => e.id !== entryId))

    // Restar el deepwork del proyecto (las sesiones de ruleta no lo sumaron).
    // La XP se recalcula sola porque se deriva del historial.
    if (!isRouletteEntry(entryToDelete)) {
      setProjects(prev => prev.map(p =>
        p.id === entryToDelete.projectId
          ? { ...p, totalDeepworks: Math.max(0, p.totalDeepworks - 1) }
          : p
      ))
    }
  }

  const handleRouletteSessionComplete = ({ topic, notes, durationMinutes }) => {
    const historyEntry = {
      id: Date.now().toString(),
      type: 'roulette',
      date: new Date().toISOString(),
      projectId: currentProject ? currentProject.id : 'default',
      projectName: currentProject ? currentProject.name : 'Investigación Enciclopédica',
      mood: '⚡ Foco Alto',
      deepworksCount: 1,
      deepworksCompleted: 1,
      duration: (durationMinutes || 15) * 60,
      xpGained: ROULETTE_XP,
      notes: `[INVESTIGACIÓN RULETA] Tema: ${topic}\nNotas: ${notes || 'Sin notas'}`
    }
    setHistory(prev => [historyEntry, ...prev])
  }

  // Ciclo Chispa → Embrague → Motor: el motor cuenta como un bloque de deep work
  const handleIgnitionComplete = (cycle) => {
    const p = projects.find(x => x.id === cycle.projectId)
    const entry = { ...cycle, world: worldOf(p).id, arc: arcOf(p) }
    setHistory(prev => [entry, ...prev])
    setProjects(prev => prev.map(p =>
      p.id === entry.projectId ? { ...p, totalDeepworks: (p.totalDeepworks || 0) + 1 } : p
    ))
    addLog('ignition_complete', { project: entry.projectName, minutes: Math.round(entry.duration / 60) })
  }

  // ============= PROYECTOS =============
  const handleDeleteProject = (projectId) => {
    setProjects(prev => prev.filter(p => p.id !== projectId))
    if (currentProject.id === projectId && projects.length > 1) {
      setCurrentProject(projects.find(p => p.id !== projectId))
    }
  }

  const handleUpdateProject = (updatedProject) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p))

    if (currentProject && currentProject.id === updatedProject.id) {
      setCurrentProject(updatedProject)
    }

    // Bonus por proyecto terminado: la XP se deriva de status === 'done',
    // así que marcar/desmarcar no permite farmear. Aquí solo avisamos.
    const oldProject = projects.find(p => p.id === updatedProject.id)
    const wasDone = oldProject?.status === 'done'
    const isDone = updatedProject.status === 'done'
    if (isDone && oldProject && !wasDone) {
      addLog('project_complete', { project: updatedProject.name, xp: PROJECT_DONE_XP })
      alert(`✨ ¡Proyecto Completado! Has ganado +${PROJECT_DONE_XP} XP`)
    } else if (!isDone && wasDone) {
      alert(`Se ha revertido la XP del proyecto (-${PROJECT_DONE_XP} XP)`)
    }
  }

  // Determinar si mostramos el header
  const showHeader = navigationScreen || screen === 'hero'

  // Salir del flujo en cualquier momento (sin quedar atrapado en una pantalla)
  const EXIT_SCREENS = ['mood', 'objective', 'config', 'warmup', 'questions', 'focus', 'break']
  const canExit = !navigationScreen && EXIT_SCREENS.includes(screen)
  const exitFlow = () => {
    const msg = screen === 'break'
      ? '¿Volver al inicio? Tus bloques anteriores ya están guardados.'
      : screen === 'focus'
        ? '¿Salir sin guardar este bloque? (Si quieres guardar los minutos, usa "Terminar bloque ahora")'
        : '¿Salir de la sesión? Volverás al inicio.'
    if (!window.confirm(msg)) return
    addLog('session_abort', { screen })
    setSessionData(EMPTY_SESSION_DATA)
    dispatch({ type: 'ABORT' })
  }

  // Error al cargar config.json (va antes del loading: si falla, nunca habrá currentProject)
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

  return (
    <WorldContext.Provider value={theme}>
    <div className="min-h-screen w-full overflow-hidden bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      {/* Atmósfera del mundo (decorativa, no intercepta clics) */}
      <div className="world-atmosphere" data-texture={theme.world.texture} aria-hidden="true" />
      <WorldLevelToast info={worldLevelUp} onClose={() => setWorldLevelUp(null)} />
      {/* Header - Solo en pantallas de navegación */}
      {showHeader && (
        <Header
          currentProject={currentProject}
          projects={projects}
          showProjectSelector={showProjectSelector}
          setShowProjectSelector={setShowProjectSelector}
          setCurrentProject={setCurrentProject}
          onMenuClick={() => setShowSidebar(true)}
          onManageProjects={() => setNavigationScreen('projects')}
          worldLabel={`${theme.world.emoji} ${theme.levelName}`}
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
      {/* Botón de salida del flujo */}
      {canExit && (
        <button
          onClick={exitFlow}
          className="fixed bottom-4 left-4 z-50 flex items-center gap-1.5 px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-gray-500 hover:text-orange-400 bg-black/70 border border-neutral-800 hover:border-orange-500/40 backdrop-blur-sm transition-colors"
          style={{ clipPath: 'polygon(5px 0%, 100% 0%, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0% 100%, 0% 5px)' }}
          aria-label="Salir de la sesión"
        >
          ✕ Salir
        </button>
      )}

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
            onAddProject={(project) => setProjects(prev => [...prev, project])}
            onDeleteProject={handleDeleteProject}
            onUpdateProject={handleUpdateProject}
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

        {navigationScreen === 'roulette' && (
          <RouletteScreen
            key="roulette"
            onCompleteSession={handleRouletteSessionComplete}
          />
        )}

        {navigationScreen === 'ignition' && (
          <IgnitionScreen
            key="ignition"
            projects={projects}
            history={history}
            onCompleteCycle={handleIgnitionComplete}
            onUpdateProject={handleUpdateProject}
          />
        )}

        {navigationScreen === 'notes' && (
          <NotesScreen
            key="notes"
            history={history}
            projects={projects}
            onUpdateProject={handleUpdateProject}
          />
        )}

        {navigationScreen === 'books' && (
          <BooksScreen key="books" />
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
                  dispatch({ type: 'START' })
                  addLog('session_start', { timestamp: new Date().toISOString() })
                }}
                onQuickStart={quickStart}
              />
            )}

            {screen === 'mood' && (
              <MoodScreen
                key="mood"
                moods={config?.moods}
                onSelectMood={(selectedMood) => {
                  const conf = moodConfigs[selectedMood]
                  dispatch({ type: 'SELECT_MOOD', mood: selectedMood, suggested: conf.suggested, focusTime: conf.focusTime })
                  addLog('mood_set', { mood: selectedMood })
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
                  dispatch({ type: 'WARMUP_DONE' })
                }}
              />
            )}

            {screen === 'objective' && (
              <ObjectiveScreen
                key="objective"
                projectName={currentProject?.name}
                suggestion={nextPendingStep(projects.find(p => p.id === currentProject?.id))?.text}
                onConfirm={(objective, phase) => dispatch({ type: 'SET_OBJECTIVE', objective, phase })}
              />
            )}

            {screen === 'config' && (
              <DeepworkConfigScreen
                key="config"
                mood={mood}
                suggestedCount={moodConfigs[mood].suggested}
                moodColors={config?.moodColors}
                countOptions={config?.deepworkCountOptions}
                onStart={(count, duration) => dispatch({ type: 'CONFIGURE', count, focusTime: duration * 60 })}
              />
            )}

            {screen === 'questions' && (
              <QuestionsScreen
                key="questions"
                onStart={(questionsList) => dispatch({ type: 'SET_QUESTIONS', questions: questionsList })}
              />
            )}

            {screen === 'focus' && (
              <FocusScreen
                key="focus"
                mood={mood}
                duration={focusTime}
                questions={questions}
                currentQuestionIndex={currentQuestionIndex}
                completedQuestions={completedQuestions}
                onAddQuestion={(question) => dispatch({ type: 'ADD_QUESTION', question })}
                onCompleteQuestion={() => dispatch({ type: 'COMPLETE_QUESTION' })}
                onComplete={(sessionInfo) => {
                  addLog('focus_complete', {
                    questions_answered: completedQuestions.length,
                    duration: focusTime
                  })
                  setSessionData(sessionInfo)
                  dispatch({ type: 'FOCUS_DONE' })
                }}
              />
            )}

            {screen === 'break' && (
              <BreakScreen
                key="break"
                duration={BREAK_DURATION}
                onComplete={() => {
                  addLog('break_complete', { duration_seconds: BREAK_DURATION })
                  dispatch({ type: 'BREAK_DONE' })
                }}
              />
            )}

            {screen === 'synthesis' && (
              <SynthesisScreen
                key="synthesis"
                onNext={(data) => dispatch({ type: 'SYNTHESIS_DONE', data })}
              />
            )}

            {screen === 'evidence' && (
              <EvidenceScreen
                key="evidence"
                onNext={(data) => {
                  addLog('evidence_added', {
                    type: data.type,
                    content_preview: data.content?.substring(0, 50)
                  })
                  saveToHistory(data)
                  dispatch({ type: 'EVIDENCE_DONE', data })
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
                  setSessionData(EMPTY_SESSION_DATA)
                  dispatch({ type: 'NEXT_BLOCK' })
                }}
                onAddExtraDeepwork={() => {
                  setSessionData(EMPTY_SESSION_DATA)
                  dispatch({ type: 'EXTRA_BLOCK' })
                }}
                onFinishDay={() => {
                  setSessionData(EMPTY_SESSION_DATA)
                  dispatch({ type: 'FINISH_DAY' })
                  setNavigationScreen('metrics')
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
    </div>
    </WorldContext.Provider>
  )
}

export default App
