import { useState } from 'react'

const cut = (n) => `polygon(${n}px 0%, 100% 0%, 100% calc(100% - ${n}px), calc(100% - ${n}px) 100%, 0% 100%, 0% ${n}px)`

// Portada de un libro: usa coverUrl si existe; si no (o si falla), genera
// una portada estilo HUD con el color, título y autor del libro.
export default function BookCover({ book, active = false, compact = false }) {
  const [imgFailed, setImgFailed] = useState(false)
  const color = book.color || '#f97316'
  const showImg = book.coverUrl && !imgFailed

  return (
    <div
      className="relative w-full h-full overflow-hidden select-none"
      style={{
        clipPath: cut(10),
        background: '#0b0b0b',
        border: `1px solid ${color}55`,
      }}
    >
      {showImg ? (
        <img
          src={book.coverUrl}
          alt={book.title}
          draggable={false}
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <div
          className="w-full h-full flex flex-col justify-between p-3"
          style={{
            background: `linear-gradient(160deg, ${color}33 0%, #0b0b0b 55%, ${color}1a 100%)`,
          }}
        >
          {/* Lomo */}
          <div className="absolute left-0 top-0 bottom-0 w-2" style={{ background: `${color}55` }} />

          <div className="flex items-center justify-between pl-2">
            {!compact && <span className="hud-label text-[8px]" style={{ color: `${color}cc` }}>// VOL</span>}
            {book.totalPages > 0 && <span className="hud-id">{book.totalPages}P</span>}
          </div>

          <div className="pl-2">
            <div className="w-8 h-[2px] mb-2" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
            <h3
              className="font-bold uppercase leading-tight text-white"
              style={{ fontFamily: "'Orbitron', sans-serif", fontSize: compact ? 10 : 15, letterSpacing: '0.04em', overflowWrap: 'break-word', hyphens: 'auto' }}
              lang="es"
            >
              {book.title || 'Sin título'}
            </h3>
            <p className={`mt-2 font-mono uppercase tracking-wider ${compact ? 'text-[8px]' : 'text-[11px]'}`} style={{ color: `${color}dd` }}>
              {book.author || 'Autor desconocido'}
            </p>
          </div>

          <div className="pl-2 flex items-center gap-1">
            {[0, 1, 2, 3, 4].map(i => (
              <span key={i} className="h-1 flex-1" style={{ background: i < 3 ? `${color}88` : `${color}22` }} />
            ))}
          </div>
        </div>
      )}

      {/* Brillo al estar al centro */}
      {active && (
        <div className="absolute inset-0 pointer-events-none" style={{
          boxShadow: `inset 0 0 0 1px ${color}, inset 0 0 30px ${color}33`,
        }} />
      )}
    </div>
  )
}
