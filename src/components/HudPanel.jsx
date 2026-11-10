// ─── HUD PANEL COMPONENT ───────────────────────────────────────────────────
export default function HudPanel({ title, mod, id, dotStatus = 'standby', children, className = '', stripeColor = '' }) {
  return (
    <div className={`hud-panel rounded-none ${className}`} style={{ fontFamily: "'Rajdhani', sans-serif" }}>
      <div className="hud-stripe" style={stripeColor ? { background: stripeColor } : {}} />
      <div className="px-3 pt-2 pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span style={{ color: 'var(--accent)', fontSize: 11 }}>△</span>
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
