import { createContext, useContext } from 'react'

// Tema del mundo activo, para los componentes que necesitan el color como valor
// (p. ej. para concatenarle transparencia: `${accent}55`). El resto usa var(--accent).
export const WorldContext = createContext(null)
const FALLBACK = { accent: '#f97316', accent2: '#ef4444', bg: '#080808', level: 0 }
export const useWorld = () => useContext(WorldContext) || FALLBACK
