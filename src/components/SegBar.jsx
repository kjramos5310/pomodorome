// ─── SEGMENTED BAR ──────────────────────────────────────────────────────────
export default function SegBar({ total = 12, filled = 0 }) {
  return (
    <div className="hud-seg-bar">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`hud-seg ${i < filled ? 'on' : ''}`} />
      ))}
    </div>
  )
}
