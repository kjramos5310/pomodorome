import { useState } from 'react'
import { Check, X, Link2, ImageOff } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { GIF_LIBRARY, normalizeGifUrl } from '../lib/gifLibrary'

const cut = (n) => `polygon(${n}px 0%, 100% 0%, 100% calc(100% - ${n}px), calc(100% - ${n}px) 100%, 0% 100%, 0% ${n}px)`

/**
 * Galería para elegir el GIF de un proyecto. Junta la biblioteca, los GIFs que ya
 * usan tus proyectos y los que pegas tú (se guardan en "Míos" para reusarlos).
 */
export default function GifGallery({ value, onChange, projectGifs = [] }) {
  const [mine, setMine] = useLocalStorage('custom_gifs', [])
  const [tab, setTab] = useState('todos')
  const [link, setLink] = useState('')
  const [error, setError] = useState('')
  const [broken, setBroken] = useState({})

  const known = new Set(GIF_LIBRARY.map(g => g.url))
  const fromProjects = projectGifs.filter(u => u && !known.has(u) && !mine.some(m => m.url === u)).map(url => ({ url, label: 'De tus proyectos' }))
  const mineItems = mine.map(m => ({ ...m, mine: true }))
  const items = tab === 'mios' ? [...mineItems, ...fromProjects] : [...mineItems, ...fromProjects, ...GIF_LIBRARY]

  const addLink = () => {
    const url = normalizeGifUrl(link)
    if (!url) { setError('Ese link no parece un GIF o una página de Giphy'); return }
    if (!mine.some(m => m.url === url) && !known.has(url)) setMine(prev => [{ url, label: 'Pegado por ti' }, ...prev])
    onChange(url); setLink(''); setError('')
  }

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        {[['todos', 'Todos'], ['mios', `Míos · ${mine.length + fromProjects.length}`]].map(([id, label]) => (
          <button key={id} type="button" onClick={() => setTab(id)}
            className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider border"
            style={{ clipPath: cut(3), borderColor: tab === id ? 'var(--accent)' : 'rgba(255,255,255,0.08)', color: tab === id ? 'var(--accent)' : '#6b7280' }}>
            {label}
          </button>
        ))}
        <button type="button" onClick={() => onChange('')}
          className="ml-auto px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider border flex items-center gap-1"
          style={{ clipPath: cut(3), borderColor: !value ? 'var(--accent)' : 'rgba(255,255,255,0.08)', color: !value ? 'var(--accent)' : '#6b7280' }}>
          <ImageOff size={10} /> Sin GIF
        </button>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-56 overflow-y-auto pr-1">
        {items.length === 0 && <p className="col-span-full text-xs text-gray-500 py-4 text-center">Aún no tienes GIFs propios. Pega un link abajo.</p>}
        {items.map(g => {
          const on = value === g.url
          return (
            <div key={g.url} className="relative group">
              <button type="button" onClick={() => onChange(g.url)} title={g.label}
                className="relative w-full aspect-[4/3] overflow-hidden border bg-black"
                style={{ clipPath: cut(5), borderColor: on ? 'var(--accent)' : 'rgba(255,255,255,0.06)', boxShadow: on ? '0 0 10px rgba(var(--accent-rgb),0.5)' : 'none' }}>
                {broken[g.url] ? (
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono text-gray-600 p-1 text-center">{g.label || 'GIF'}</span>
                ) : (
                  <img src={g.url} alt={g.label || 'GIF'} loading="lazy" draggable={false}
                    onError={() => setBroken(b => ({ ...b, [g.url]: true }))}
                    className={`w-full h-full object-cover transition-opacity ${on ? 'opacity-100' : 'opacity-60 group-hover:opacity-90'}`} />
                )}
                {on && <span className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center" style={{ background: 'var(--accent)' }}><Check size={11} className="text-black" /></span>}
              </button>
              {g.mine && (
                <button type="button" onClick={() => { setMine(prev => prev.filter(m => m.url !== g.url)); if (on) onChange('') }}
                  className="absolute bottom-1 right-1 w-4 h-4 bg-black/80 text-gray-400 hover:text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100"
                  aria-label="Quitar de mis GIFs"><X size={10} /></button>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex gap-1.5 mt-2">
        <div className="relative flex-1">
          <Link2 size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-600" />
          <input value={link} onChange={e => { setLink(e.target.value); setError('') }}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLink() } }}
            placeholder="Pega un link de Giphy o un .gif"
            className="w-full pl-7 pr-2 py-2 bg-black/60 border border-white/10 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[var(--accent)]"
            style={{ clipPath: cut(4) }} />
        </div>
        <button type="button" onClick={addLink} disabled={!link.trim()} aria-label="Añadir GIF"
          className="px-3 text-[10px] font-bold uppercase text-black disabled:opacity-30" style={{ clipPath: cut(4), background: 'var(--accent)' }}>
          Añadir
        </button>
      </div>
      {error && <p className="text-[10px] font-mono text-red-400 mt-1">// {error}</p>}
    </div>
  )
}
