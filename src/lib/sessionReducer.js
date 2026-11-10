// ============= FLUJO DE SESIÓN DEEPWORK =============
// Todo el estado de una sesión (pantalla actual, mood, preguntas, síntesis…)
// vive aquí. Cada pantalla del flujo dispara una acción y el reducer decide
// cuál es la siguiente pantalla. Es una función pura: fácil de testear.
//
// Flujo normal (primer bloque):
//   hero → mood → objective → config → warmup → questions → focus
//        → synthesis → evidence → completed → (break → warmup → questions …)
// Primero se define QUÉ vas a hacer; el warm-up escanea ese material.

export const QUICK_START_FOCUS_TIME = 25 * 60
export const BREAK_DURATION = 5 * 60

export const initialSessionState = {
  screen: 'hero',
  mood: null,
  focusTime: null,          // segundos del bloque de foco actual
  deepworkCount: 1,         // bloques planeados
  currentDeepwork: 1,       // bloque en curso (1-based)
  questions: [],
  currentQuestionIndex: 0,
  completedQuestions: [],   // índices de preguntas completadas
  logs: [],
  synthesisData: {},
  evidenceData: {},
  sessionObjective: '',
  learningPhase: null,      // 'captura' | 'proceso' | 'output'
}

// Lo que se limpia entre un bloque y el siguiente
const blockReset = {
  completedQuestions: [],
  questions: [],
  synthesisData: {},
  evidenceData: {},
  logs: [],
}

export function sessionReducer(state, action) {
  switch (action.type) {
    case 'LOG':
      return { ...state, logs: [...state.logs, action.entry] }

    case 'START':
      return { ...state, screen: 'mood' }

    case 'QUICK_START':
      // Salta directo al focus con defaults
      return {
        ...state,
        mood: state.mood || 'neutro',
        focusTime: QUICK_START_FOCUS_TIME,
        deepworkCount: 1,
        questions: ['Enfocarse en la tarea'],
        currentQuestionIndex: 0,
        completedQuestions: [],
        screen: 'focus',
      }

    case 'SELECT_MOOD':
      return {
        ...state,
        mood: action.mood,
        deepworkCount: action.suggested,
        focusTime: action.focusTime,
        // Si ya hay objetivo (bloques siguientes), directo al warm-up
        screen: state.sessionObjective ? 'warmup' : 'objective',
      }

    case 'WARMUP_DONE':
      return { ...state, screen: 'questions' }

    case 'SET_OBJECTIVE':
      return {
        ...state,
        sessionObjective: action.objective,
        learningPhase: action.phase,
        screen: 'config',
      }

    case 'CONFIGURE':
      // Sobrescribe la duración sugerida por el mood
      return { ...state, deepworkCount: action.count, focusTime: action.focusTime, screen: 'warmup' }

    case 'SET_QUESTIONS':
      return {
        ...state,
        questions: action.questions,
        currentQuestionIndex: 0,
        completedQuestions: [],
        screen: 'focus',
      }

    case 'ADD_QUESTION': {
      const questions = [...state.questions, action.question]
      // Si la pregunta actual ya estaba completada, pasar a la nueva
      const currentDone = state.completedQuestions.includes(state.currentQuestionIndex)
      return { ...state, questions, currentQuestionIndex: currentDone ? questions.length - 1 : state.currentQuestionIndex }
    }

    case 'COMPLETE_QUESTION': {
      const { currentQuestionIndex, questions } = state
      return {
        ...state,
        completedQuestions: [...state.completedQuestions, currentQuestionIndex],
        currentQuestionIndex:
          currentQuestionIndex < questions.length - 1 ? currentQuestionIndex + 1 : currentQuestionIndex,
      }
    }

    case 'FOCUS_DONE':
      return { ...state, screen: 'synthesis' }

    case 'SYNTHESIS_DONE':
      return { ...state, synthesisData: action.data, screen: 'evidence' }

    case 'EVIDENCE_DONE':
      return { ...state, evidenceData: action.data, screen: 'completed' }

    case 'NEXT_BLOCK':
      return { ...state, ...blockReset, currentDeepwork: state.currentDeepwork + 1, screen: 'break' }

    case 'EXTRA_BLOCK':
      return {
        ...state,
        ...blockReset,
        deepworkCount: state.deepworkCount + 1,
        currentDeepwork: state.currentDeepwork + 1,
        screen: 'break',
      }

    case 'BREAK_DONE':
      return { ...state, screen: 'warmup' }

    case 'FINISH_DAY':
    case 'ABORT':      // salir del flujo sin guardar el bloque en curso
      return { ...initialSessionState }

    default:
      throw new Error(`sessionReducer: acción desconocida "${action.type}"`)
  }
}
