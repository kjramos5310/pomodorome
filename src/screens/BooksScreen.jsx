import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, X, BookOpen } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import HudPanel from '../components/HudPanel'
import BookCover from '../components/BookCover'
import Coverflow from '../components/Coverflow'
import { BOOK_STATUSES, COVER_COLORS, SEED_BOOKS, getStatus, bookProgress, newBookId } from '../lib/books'

const cut = (n) => `polygon(${n}px 0%, 100% 0%, 100% calc(100% - ${n}px), calc(100% - ${n}px) 100%, 0% 100%, 0% ${n}px)`

const EMPTY_FORM = { title: '', author: '', totalPages: '', pagesRead: '', status: 'todo', color: COVER_COLORS[0], coverUrl: '', notes: '' }

// ============= BOOKS SCREEN =============
export default function BooksScreen() {
  const [books, setBooks] = useLocalStorage('deepwork_books', SEED_BOOKS)
  const [filter, setFilter] = useState('all')
  const [activeIndex, setActiveIndex] = useState(0)
  const [form, setForm] = useState(null) // null = cerrado; { ...campos, id? } = abierto

  const visible = filter === 'all' ? books : books.filter(b => b.status === filter)
  const active = Math.min(activeIndex, Math.max(0, visible.length - 1))
  const current = visible[active]


  const changeFilter = (f) => { setFilter(f); setActiveIndex(0) }

  const updateBook = (id, patch) => setBooks(prev => prev.map(b => (b.id === id ? { ...b, ...patch } : b)))

  const setPages = (book, pages) => {
    const pagesRead = Math.max(0, Math.min(book.totalPages || Infinity, pages))
    const patch = { pagesRead }
    if (book.totalPages && pagesRead >= book.totalPages) patch.status = 'done'
    else if (pagesRead > 0 && book.status === 'todo') patch.status = 'reading'
    updateBook(book.id, patch)
  }

  const deleteBook = (book) => {
    if (!window.confirm(`¿Eliminar "${book.title}" de tu biblioteca?`)) return
    setBooks(prev => prev.filter(b => b.id !== book.id))
  }

  const saveForm = () => {
    if (!form.title.trim()) return
    const data = {
      ...form,
      title: form.title.trim(),
      author: form.author.trim(),
      coverUrl: form.coverUrl.trim(),
      totalPages: Number(form.totalPages) || 0,
      pagesRead: Number(form.pagesRead) || 0,
    }
    if (form.id) {
      updateBook(form.id, data)
    } else {
      const book = { ...data, id: newBookId() }
      setBooks(prev => [...prev, book])
      // Mostrar el libro nuevo al centro
      setFilter('all')
      setActiveIndex(books.length)
    }
    setForm(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-full pt-24 pb-10 relative text-white overflow-x-hidden"
      style={{ background: 'var(--bg)', fontFamily: "'Rajdhani', sans-serif" }}
    >
      <div className="hud-scanline" />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 60% 40% at 50% 35%, rgba(var(--accent-rgb),0.07) 0%, transparent 70%)'
      }} />

      {/* ── Título ── */}
      <div className="relative z-10 px-4 sm:px-6 max-w-xl mx-auto flex items-end justify-between mb-4">
        <div>
          <p className="hud-label" style={{ color: 'rgba(var(--accent-rgb),0.5)' }}>// ARCHIVO_DE_CONOCIMIENTO</p>
          <h1 className="hud-title text-3xl mt-1 flex items-center gap-2">
            <BookOpen size={26} className="text-orange-500" /> Libros
          </h1>
        </div>
        <button
          onClick={() => setForm({ ...EMPTY_FORM })}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider text-black bg-orange-500 hover:bg-orange-400 transition-colors"
          style={{ clipPath: cut(6) }}
        >
          <Plus size={14} /> Añadir
        </button>
      </div>

      {/* ── Filtros ── */}
      <div className="relative z-10 px-4 sm:px-6 max-w-xl mx-auto flex gap-2 mb-2 overflow-x-auto pb-1">
        {[{ id: 'all', label: 'Todos', color: 'var(--accent)' }, ...BOOK_STATUSES].map(s => {
          const count = s.id === 'all' ? books.length : books.filter(b => b.status === s.id).length
          const on = filter === s.id
          return (
            <button
              key={s.id}
              onClick={() => changeFilter(s.id)}
              className="flex-shrink-0 px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider border transition-colors"
              style={{
                clipPath: cut(4),
                borderColor: on ? s.color : 'rgba(var(--accent-rgb),0.15)',
                color: on ? '#080808' : '#9ca3af',
                background: on ? s.color : 'rgba(var(--accent-rgb),0.02)',
              }}
            >
              {s.label} · {count}
            </button>
          )
        })}
      </div>

      {/* ── Carrusel ── */}
      {visible.length === 0 ? (
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6" style={{ height: 300 }}>
          <p className="hud-label mb-2">// SIN_REGISTROS</p>
          <p className="text-gray-400 text-sm mb-4">No hay libros en esta sección todavía.</p>
          <button onClick={() => setForm({ ...EMPTY_FORM })} className="text-orange-400 text-sm underline underline-offset-4">
            Añadir un libro
          </button>
        </div>
      ) : (
        <Coverflow
          items={visible}
          activeIndex={active}
          onChange={setActiveIndex}
          disableKeys={!!form}
          getColor={(b) => b.color || '#f97316'}
          renderCard={(book, isActive) => <BookCover book={book} active={isActive} />}
        />
      )}

      {/* ── Ficha del libro del centro ── */}
      <div className="relative z-10 px-4 sm:px-6 max-w-xl mx-auto">
        <AnimatePresence mode="wait">
          {current && (
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <BookDetail
                book={current}
                onPages={(p) => setPages(current, p)}
                onStatus={(status) => updateBook(current.id, { status })}
                onNotes={(notes) => updateBook(current.id, { notes })}
                onEdit={() => setForm({ ...EMPTY_FORM, ...current, totalPages: String(current.totalPages || ''), pagesRead: String(current.pagesRead || '') })}
                onDelete={() => deleteBook(current)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Formulario añadir / editar ── */}
      <AnimatePresence>
        {form && <BookForm form={form} setForm={setForm} onSave={saveForm} onClose={() => setForm(null)} />}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Ficha del libro seleccionado ──────────────────────────────────────────
function BookDetail({ book, onPages, onStatus, onNotes, onEdit, onDelete }) {
  const status = getStatus(book.status)
  const progress = bookProgress(book)

  return (
    <HudPanel title="LIBRO_SELECCIONADO" mod="BK-ARCH" id={book.id.slice(-6).toUpperCase()} dotStatus={book.status === 'done' ? 'active' : 'standby'} stripeColor={book.color}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold leading-tight break-words">{book.title}</h2>
          <p className="text-sm text-gray-400 font-mono mt-0.5">{book.author || 'Autor desconocido'}</p>
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          <button onClick={onEdit} className="p-2 text-gray-400 hover:text-orange-400 border border-orange-500/15" style={{ clipPath: cut(4) }} aria-label="Editar">
            <Pencil size={14} />
          </button>
          <button onClick={onDelete} className="p-2 text-gray-400 hover:text-red-400 border border-orange-500/15" style={{ clipPath: cut(4) }} aria-label="Eliminar">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Estado */}
      <div className="flex gap-2 mt-3">
        {BOOK_STATUSES.map(s => (
          <button
            key={s.id}
            onClick={() => onStatus(s.id)}
            className="flex-1 py-1.5 text-[10px] font-mono uppercase tracking-wider border transition-colors"
            style={{
              clipPath: cut(4),
              borderColor: book.status === s.id ? s.color : 'rgba(255,255,255,0.08)',
              color: book.status === s.id ? s.color : '#6b7280',
              background: book.status === s.id ? `${s.color}14` : 'transparent',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Progreso */}
      <div className="mt-4">
        <div className="flex items-baseline justify-between mb-1">
          <span className="hud-label">// PROGRESO</span>
          <span className="font-mono text-xs text-gray-400">
            <span className="hud-value text-base" style={{ color: status.color }}>{progress}%</span>
            {book.totalPages > 0 && <> · {book.pagesRead} / {book.totalPages} págs</>}
          </span>
        </div>
        <div className="w-full h-2.5 bg-neutral-950 border border-orange-500/10 overflow-hidden" style={{ clipPath: cut(2) }}>
          <motion.div
            className="h-full"
            style={{ background: `linear-gradient(to right, ${book.color || '#f97316'}, ${status.color})` }}
            initial={false}
            animate={{ width: `${progress}%` }}
          />
        </div>
        {book.totalPages > 0 && (
          <div className="flex gap-2 mt-2">
            {[-10, -1, 1, 10].map(d => (
              <button
                key={d}
                onClick={() => onPages(book.pagesRead + d)}
                className="flex-1 py-1.5 text-xs font-mono border border-orange-500/15 text-gray-300 hover:border-orange-500/50 hover:text-orange-400 transition-colors"
                style={{ clipPath: cut(4) }}
              >
                {d > 0 ? `+${d}` : d}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notas */}
      <div className="mt-4">
        <span className="hud-label">// NOTAS</span>
        <textarea
          value={book.notes || ''}
          onChange={(e) => onNotes(e.target.value)}
          placeholder="Ideas clave, citas, qué aplicar…"
          rows={3}
          className="w-full mt-1 p-3 bg-black/50 border border-orange-500/15 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-orange-500/50 resize-none"
          style={{ clipPath: cut(6) }}
        />
      </div>
    </HudPanel>
  )
}

// ─── Modal añadir / editar ─────────────────────────────────────────────────
function BookForm({ form, setForm, onSave, onClose }) {
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const input = 'w-full p-2.5 bg-black/60 border border-orange-500/20 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/60'

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/70 z-[300]" />
      <div className="fixed inset-0 z-[310] flex items-center justify-center p-4 pointer-events-none">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        className="pointer-events-auto w-full max-w-md max-h-[90vh] overflow-y-auto border border-orange-500/30 p-5"
        style={{ background: '#0b0b0b', clipPath: cut(12), fontFamily: "'Rajdhani', sans-serif" }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="hud-label" style={{ color: 'rgba(var(--accent-rgb),0.5)' }}>// {form.id ? 'EDITAR_REGISTRO' : 'NUEVO_REGISTRO'}</p>
            <h3 className="hud-title text-xl text-white">{form.id ? 'Editar libro' : 'Añadir libro'}</h3>
          </div>
          <button onClick={onClose} className="p-2 text-orange-400 border border-orange-500/20" style={{ clipPath: cut(4) }} aria-label="Cerrar">
            <X size={16} />
          </button>
        </div>

        <div className="flex gap-4">
          <div className="w-24 h-36 flex-shrink-0">
            <BookCover book={{ ...form, totalPages: Number(form.totalPages) || 0 }} active compact />
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <input autoFocus className={input} style={{ clipPath: cut(4) }} placeholder="Título *" value={form.title} onChange={set('title')} />
            <input className={input} style={{ clipPath: cut(4) }} placeholder="Autor" value={form.author} onChange={set('author')} />
            <div className="flex gap-2">
              <input className={input} style={{ clipPath: cut(4) }} type="number" min="0" placeholder="Leídas" value={form.pagesRead} onChange={set('pagesRead')} />
              <input className={input} style={{ clipPath: cut(4) }} type="number" min="0" placeholder="Págs" value={form.totalPages} onChange={set('totalPages')} />
            </div>
          </div>
        </div>

        <input className={`${input} mt-3`} style={{ clipPath: cut(4) }} placeholder="URL de portada (opcional)" value={form.coverUrl} onChange={set('coverUrl')} />

        <p className="hud-label mt-4 mb-1.5">// COLOR</p>
        <div className="flex gap-2">
          {COVER_COLORS.map(c => (
            <button
              key={c}
              onClick={() => setForm(f => ({ ...f, color: c }))}
              className="w-8 h-8"
              style={{ background: c, clipPath: cut(4), outline: form.color === c ? '2px solid white' : 'none', outlineOffset: -4 }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>

        <p className="hud-label mt-4 mb-1.5">// ESTADO</p>
        <div className="flex gap-2">
          {BOOK_STATUSES.map(s => (
            <button
              key={s.id}
              onClick={() => setForm(f => ({ ...f, status: s.id }))}
              className="flex-1 py-1.5 text-[10px] font-mono uppercase tracking-wider border"
              style={{
                clipPath: cut(4),
                borderColor: form.status === s.id ? s.color : 'rgba(255,255,255,0.08)',
                color: form.status === s.id ? s.color : '#6b7280',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <button
          onClick={onSave}
          disabled={!form.title.trim()}
          className="w-full mt-5 py-3 font-bold uppercase tracking-wider text-black bg-orange-500 hover:bg-orange-400 disabled:opacity-30 transition-colors"
          style={{ clipPath: cut(8) }}
        >
          {form.id ? 'Guardar cambios' : 'Añadir a la biblioteca'}
        </button>
      </motion.div>
      </div>
    </>
  )
}
