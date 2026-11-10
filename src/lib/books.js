// ============= BIBLIOTECA =============

export const BOOK_STATUSES = [
  { id: 'reading', label: 'Leyendo', color: '#f97316' },
  { id: 'todo', label: 'Por leer', color: '#9ca3af' },
  { id: 'done', label: 'Terminado', color: '#22c55e' },
]

export const getStatus = (id) => BOOK_STATUSES.find(s => s.id === id) || BOOK_STATUSES[1]

// Colores disponibles para las portadas generadas
export const COVER_COLORS = ['#f97316', '#ef4444', '#a855f7', '#3b82f6', '#22c55e', '#eab308']

// Libros de ejemplo (se pueden borrar desde la app)
export const SEED_BOOKS = [
  { id: 'seed-1', title: 'Deep Work', author: 'Cal Newport', totalPages: 296, pagesRead: 120, status: 'reading', color: '#f97316', coverUrl: '', notes: '' },
  { id: 'seed-2', title: 'Hábitos Atómicos', author: 'James Clear', totalPages: 328, pagesRead: 328, status: 'done', color: '#22c55e', coverUrl: '', notes: '' },
  { id: 'seed-3', title: 'Driven to Distraction', author: 'Hallowell & Ratey', totalPages: 384, pagesRead: 0, status: 'todo', color: '#a855f7', coverUrl: '', notes: '' },
  { id: 'seed-4', title: 'Indistractable', author: 'Nir Eyal', totalPages: 304, pagesRead: 45, status: 'reading', color: '#3b82f6', coverUrl: '', notes: '' },
  { id: 'seed-5', title: 'Make Time', author: 'Knapp & Zeratsky', totalPages: 304, pagesRead: 0, status: 'todo', color: '#eab308', coverUrl: '', notes: '' },
]

export const bookProgress = (book) =>
  book.totalPages > 0 ? Math.min(100, Math.round((book.pagesRead / book.totalPages) * 100)) : 0

export const newBookId = () => `book-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
