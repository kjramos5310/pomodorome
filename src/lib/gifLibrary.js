// ============= BIBLIOTECA DE GIFS =============
// GIFs disponibles para cualquier proyecto, sin atarlos a un nombre o categoría.

const giphy = (id) => `https://media.giphy.com/media/${id}/giphy.gif`

export const GIF_LIBRARY = [
  // Añadidos
  { id: 'FYOsEpYK7zHs3eDXmg', label: 'Gojo · Jujutsu Kaisen' },
  { id: 'XZ6GKrKBYydDpmldhE', label: 'Gyro Zeppeli · JoJo Parte 7' },
  { id: 'n6ly3sYW5uI8zYfWkx', label: 'Godfall · Aperion' },
  { id: 'o4ai0qddfzB5XQFyF3', label: 'Elder Scrolls Online · Bretons' },
  { id: 'iReTQoay8uJfDoiKWr', label: 'Xbox Series X|S · I' },
  { id: 'dBsJwo17cbYvs8vqfx', label: 'Xbox Series X|S · II' },
  { id: 'QoAzxJE7t1FdnNiN5H', label: 'Xbox Series X|S · III' },
  { id: 'kGn7UKH3vlwrN2aFNd', label: 'Xbox Series X|S · IV' },
  { id: 'Z09cOCJdq9rfIBdaew', label: 'Xbox Series X|S · V' },
  { id: 'rU0mPE8JzRkpDhcY0o', label: 'Xbox Series X|S · VI' },
  // De las plantillas originales
  { id: 'U4ZItT6PM3leNZsBtt', label: 'Programación' },
  { id: 'TjFUxbRz3cgfbHmQxs', label: 'Redes', url: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExc3VhODQxc2cxbW83OXVqbTBxYTJuaGwwbjhyMnlqc2RsazliaGxoNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/TjFUxbRz3cgfbHmQxs/giphy.gif' },
  { id: 'Tk0g95CHcEuLVveAj3', label: 'Inteligencia Artificial' },
  { id: 'LpiA8MVudQO8pitF4c', label: 'Tesis', url: 'https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3bnpvbWU1Y2F5cW04dThsOWtlZDcyNW9zOTh2eXBnbjN5Z2Z4b2E3ZCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/LpiA8MVudQO8pitF4c/giphy.gif' },
  { id: 'TKDSgScrDV3yPKXMfI', label: 'Inglés' },
  { id: 'yYU6Mivn9bhV0x8BmX', label: 'Fuerza' },
  { id: 'UkkOy67JwSPAGOtuXS', label: 'Improvisación' },
  { id: 'YWOs5jNvBu9VVpw37A', label: 'Lectura' },
  { id: 'FSZoHhWyU5iESIz0lo', label: 'Shadowing' },
].map(g => ({ ...g, url: g.url || giphy(g.id) }))

/**
 * Acepta un link de página de Giphy (giphy.com/gifs/nombre-ID), un link de media
 * o cualquier URL directa de imagen. Devuelve la URL directa o null si no sirve.
 */
export function normalizeGifUrl(input) {
  const s = (input || '').trim()
  if (!s) return null
  let u
  try { u = new URL(s) } catch { return null }
  if (u.hostname.endsWith('giphy.com')) {
    // media.giphy.com/media/<...>/ID/giphy.gif  o  giphy.com/gifs/slug-ID  o  giphy.com/embed/ID
    const parts = u.pathname.split('/').filter(Boolean)
    if (parts[0] === 'media' || u.hostname.startsWith('media') || u.hostname.startsWith('i.giphy')) {
      return s
    }
    const last = parts[parts.length - 1] || ''
    const id = last.includes('-') ? last.split('-').pop() : last
    return /^[A-Za-z0-9]{6,}$/.test(id) ? giphy(id) : null
  }
  return /^https?:$/.test(u.protocol) ? s : null
}
