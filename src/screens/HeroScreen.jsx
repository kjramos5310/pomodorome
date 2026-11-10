import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getLocalYMD, getLocalYMDH } from '../lib/dates'
import HudPanel from '../components/HudPanel'
import SegBar from '../components/SegBar'

// ─── 1. HERO SCREEN ─────────────────────────────────────────────────────────
export default function HeroScreen({ onStart, onQuickStart, currentRank, currentLevel, progressToNext, history, dailyGoal, onSetDailyGoal }) {
  const [now, setNow] = useState(new Date())
  const [editingGoal, setEditingGoal] = useState(false)
  const [goalInput, setGoalInput] = useState(String(dailyGoal))
  const [activeMobileTab, setActiveMobileTab] = useState('timer') // 'timer' | 'pilot' | 'stats'

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(t)
  }, [])

  // ── Today stats ────────────────────────────────────────────────────────────
  const todayStr = getLocalYMD()
  const todayEntries = (history || []).filter(e => getLocalYMD(e.date) === todayStr)
  const todaySeconds = todayEntries.reduce((s, e) => s + (e.duration || 0), 0)
  const todayHours = todaySeconds / 3600
  const pct = Math.min(todayHours / dailyGoal, 1)
  const done = pct >= 1

  // ── Week stats ─────────────────────────────────────────────────────────────
  const weekAgo = Date.now() - 7 * 24 * 3600 * 1000
  const weekEntries = (history || []).filter(e => new Date(e.date).getTime() >= weekAgo)
  const weekSessions = weekEntries.length
  const weekHours = +(weekEntries.reduce((s, e) => s + (e.duration || 0), 0) / 3600).toFixed(1)

  // ── Level segments ─────────────────────────────────────────────────────────
  const levelSegs = 12
  const filledSegs = Math.round((progressToNext / 100) * levelSegs)

  // ── Status ─────────────────────────────────────────────────────────────────
  const statusLabel = done ? 'COMPLETADO' : todayEntries.length > 0 ? 'ACUMULANDO' : 'INACTIVO'
  const statusDot = done ? 'active' : todayEntries.length > 0 ? 'standby' : 'idle'

  // Update ring dimensions
  const R = 140
  const CIRC = 2 * Math.PI * R
  const ringDash = pct * CIRC

  // ── Remaining ──────────────────────────────────────────────────────────────
  const remSec = Math.max(0, dailyGoal * 3600 - todaySeconds)
  const remH = Math.floor(remSec / 3600)
  const remM = Math.floor((remSec % 3600) / 60)

  const handleGoalSave = () => {
    const val = parseFloat(goalInput)
    if (!isNaN(val) && val > 0 && val <= 24) onSetDailyGoal(val)
    setEditingGoal(false)
  }

  // ── Days of week ───────────────────────────────────────────────────────────
  const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
  const todayDow = (new Date().getDay() + 6) % 7 // 0=Mon

  // Recent sessions (last 4 for the panel)
  const recentSessions = [...(history || [])].slice(0, 4)

  // ── Racha / Streak calculation (extracted from MetricsScreen) ──────────────────
  const calcStreak = () => {
    if (!history || history.length === 0) return { current: 0, best: 0 }
    const dates = [...new Set(history.map(e => getLocalYMD(e.date)))].sort((a, b) => b.localeCompare(a))
    const today = getLocalYMD()
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
    const yStr = getLocalYMD(yesterday)
    let current = 0
    if (dates[0] === today || dates[0] === yStr) {
      current = 1
      for (let i = 1; i < dates.length; i++) {
        const diff = (new Date(dates[i - 1]) - new Date(dates[i])) / 86400000
        if (diff === 1) current++; else break
      }
    }
    let best = 0, streak = 1
    for (let i = 1; i < dates.length; i++) {
      const diff = (new Date(dates[i - 1]) - new Date(dates[i])) / 86400000
      if (diff === 1) streak++; else { best = Math.max(best, streak); streak = 1 }
    }
    return { current, best: Math.max(best, streak, current) }
  }
  const { current: currentStreak } = calcStreak()

  // Get active days of current week
  const activeDaysThisWeek = days.map((_, i) => {
    const currentWeekStart = new Date()
    const currentDay = currentWeekStart.getDay() // 0=Sun, 1=Mon, ..., 6=Sat
    const daysSinceMon = currentDay === 0 ? 6 : currentDay - 1
    currentWeekStart.setDate(currentWeekStart.getDate() - daysSinceMon + i)
    const ymd = getLocalYMD(currentWeekStart)
    return (history || []).some(e => getLocalYMD(e.date) === ymd)
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full relative overflow-hidden pt-[68px]"
      style={{ background: 'var(--bg)', fontFamily: "'Rajdhani', sans-serif", height: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      {/* Scanline overlay */}
      <div className="hud-scanline" />

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(var(--accent-rgb),0.05) 0%, transparent 70%)'
      }} />

      {/* ── TOP HEADER BAR ──────────────────────────────────────────────── */}
      <div className="hidden lg:flex items-center justify-between px-4 h-[40px] shrink-0 border-b border-orange-500/10"
        style={{ background: 'rgba(var(--accent-rgb),0.03)' }}>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded" style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            boxShadow: '0 0 10px rgba(var(--accent-rgb),0.5)'
          }} />
          <span className="hud-title text-white text-xs tracking-widest">DEEPWORK</span>
        </div>
        <span className="hud-label text-[9px]" style={{ color: 'rgba(var(--accent-rgb),0.5)', letterSpacing: '0.2em' }}>
          DEEPWORK // OVERDRIVE_FRAME
        </span>
      </div>

      {/* ── MOBILE HUD TAB SELECTOR ───────────────────────────────────── */}
      <div className="flex lg:hidden items-center justify-around border-b border-orange-500/10 px-4 h-[44px] shrink-0"
        style={{ background: 'rgba(var(--accent-rgb),0.02)' }}>
        <button
          onClick={() => setActiveMobileTab('pilot')}
          className={`flex-1 h-full font-bold text-xs tracking-wider transition-all border-b-2 ${
            activeMobileTab === 'pilot'
              ? 'border-orange-500 text-orange-500 font-extrabold text-shadow-[0_0_8px_var(--accent)]'
              : 'border-transparent text-gray-500'
          }`}
          style={{ fontFamily: "'Rajdhani', sans-serif" }}
        >
          // PILOTO
        </button>
        <button
          onClick={() => setActiveMobileTab('timer')}
          className={`flex-1 h-full font-bold text-xs tracking-wider transition-all border-b-2 ${
            activeMobileTab === 'timer'
              ? 'border-orange-500 text-orange-500 font-extrabold text-shadow-[0_0_8px_var(--accent)]'
              : 'border-transparent text-gray-500'
          }`}
          style={{ fontFamily: "'Rajdhani', sans-serif" }}
        >
          // ENFOQUE
        </button>
        <button
          onClick={() => setActiveMobileTab('stats')}
          className={`flex-1 h-full font-bold text-xs tracking-wider transition-all border-b-2 ${
            activeMobileTab === 'stats'
              ? 'border-orange-500 text-orange-500 font-extrabold text-shadow-[0_0_8px_var(--accent)]'
              : 'border-transparent text-gray-500'
          }`}
          style={{ fontFamily: "'Rajdhani', sans-serif" }}
        >
          // REPORTES
        </button>
      </div>

      {/* ── MAIN GRID ───────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── ODYSSEY LEFT PANEL (image 3 style) ──────────────────────── */}
        <div className={`relative shrink-0 border-orange-500/15 h-full overflow-hidden ${
          activeMobileTab === 'pilot' ? 'flex w-full justify-center border-b border-orange-500/10' : 'hidden lg:flex lg:border-r'
        }`}
          style={{ width: activeMobileTab === 'pilot' ? '100%' : 200, background: '#090909' }}>
          <div className="relative w-[200px] h-full shrink-0">

          {/* Hazard stripe top */}
          <div className="hud-stripe absolute top-0 left-0 right-0" style={{ zIndex: 2 }} />

          {/* OD-01 identifier */}
          <div className="absolute top-5 right-3 z-10">
            <span className="hud-label" style={{ fontSize: 9, color: 'rgba(var(--accent-rgb),0.5)' }}>OD-01</span>
          </div>

          {/* Left edge: vertical level progress bar */}
          <div className="absolute left-0 top-8 bottom-8 flex flex-col items-center" style={{ width: 8 }}>
            <div style={{
              flex: 1,
              width: 3,
              background: 'rgba(var(--accent-rgb),0.08)',
              position: 'relative',
              borderRadius: 2
            }}>
              <div style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0,
                height: `${progressToNext}%`,
                background: 'linear-gradient(to top, var(--accent), var(--accent-2))',
                borderRadius: 2,
                boxShadow: '0 0 6px rgba(var(--accent-rgb),0.6)'
              }} />
            </div>
          </div>

          {/* BIG vertical ODYSSEY text */}
          <div className="absolute left-3 top-0 bottom-0 flex items-center" style={{ zIndex: 1 }}>
            <span style={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              transform: 'rotate(180deg)',
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 900,
              fontSize: 48,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              background: 'linear-gradient(to top, rgba(var(--accent-rgb),0.9), rgba(239,68,68,0.95))',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              filter: 'drop-shadow(0 0 12px rgba(var(--accent-rgb),0.5))',
              lineHeight: 1,
              userSelect: 'none'
            }}>
              {(currentRank.name || 'ODYSSEY').toUpperCase()}
            </span>
          </div>

          {/* Diagnostic connecting lines overlay */}
          <svg className="absolute pointer-events-none" style={{ left: 55, top: 40, width: 120, height: 180, zIndex: 0 }}>
            {/* Line from top area (near OD-01) to logo */}
            <path d="M 90 5 L 90 22 L 50 22 L 50 35" fill="none" stroke="rgba(var(--accent-rgb),0.3)" strokeWidth="1" />
            <circle cx="90" cy="5" r="2" fill="var(--accent)" />
            {/* Line from logo to TECH_DATA */}
            <path d="M 50 100 L 50 115 L 10 115" fill="none" stroke="rgba(var(--accent-rgb),0.3)" strokeWidth="1" />
            <circle cx="10" cy="115" r="2" fill="var(--accent)" />
          </svg>

          {/* Right content: avatar outline + tech data */}
          <div className="absolute right-0 top-12 bottom-16 flex flex-col justify-start items-center" style={{ left: 55, padding: '4px' }}>

            {/* Gray/White Oni Mask Outline Logo (matches Image 3 style, no duplicate red GIF) */}
            <div className="mb-4 flex flex-col items-center justify-center" style={{ width: 100, height: 100, relative: 'true' }}>
              <svg width="68" height="68" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-gray-500 opacity-80">
                {/* Outermost dash polygon */}
                <path d="M 50 12 L 22 35 L 22 65 L 50 88 L 78 65 L 78 35 Z" strokeWidth="1" strokeDasharray="3 3" />
                {/* Main Oni face frame */}
                <path d="M 50 18 L 28 37 L 28 63 L 50 82 L 72 63 L 72 37 Z" />
                {/* Horns */}
                <path d="M 28 37 L 13 18 L 22 20 Z" fill="currentColor" opacity="0.8" />
                <path d="M 72 37 L 87 18 L 78 20 Z" fill="currentColor" opacity="0.8" />
                {/* Eyes */}
                <path d="M 36 48 L 45 52" strokeWidth="3" />
                <path d="M 64 48 L 55 52" strokeWidth="3" />
                {/* Eyebrows */}
                <path d="M 32 44 L 46 47" strokeWidth="2" strokeLinecap="round" />
                <path d="M 68 44 L 54 47" strokeWidth="2" strokeLinecap="round" />
                {/* Nose outline */}
                <path d="M 50 50 L 45 61 L 55 61 Z" fill="currentColor" opacity="0.6" />
                {/* Teeth and mouth */}
                <path d="M 35 67 L 40 62 L 45 67 L 50 62 L 55 67 L 60 62 L 65 67" />
                <path d="M 33 71 L 67 71 L 50 80 Z" strokeWidth="1.5" />
              </svg>
              <p className="hud-label text-center mt-2" style={{ fontSize: 8, color: 'rgba(var(--accent-rgb),0.45)', whiteSpace: 'nowrap' }}>
                Odyssey #1 || Prog. Life
              </p>
            </div>

            {/* TECH_DATA */}
            <div className="w-full pl-2">
              <p style={{ color: 'var(--accent)', fontFamily: "'Share Tech Mono',monospace", fontSize: 10, marginBottom: 4 }}>
                ● TECH_DATA
              </p>
              <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: '#4b5563', lineHeight: 1.6 }}>
                <p>PILOT: <span style={{ color: '#888' }}>[YISUS]</span></p>
                <p>FRAME: <span style={{ color: '#888' }}>DW_CORE</span></p>
                <p>DEPLOYED: <span style={{ color: '#888' }}>{(history || []).length} SES.</span></p>
                <p>TOTAL_OP: <span style={{ color: '#888' }}>{weekHours}H</span></p>
                <p>STATUS: <span style={{ color: statusDot === 'active' ? '#22c55e' : 'var(--accent)' }}>{statusLabel}</span></p>
              </div>
            </div>
          </div>

          {/* PROGRAMMING_LIFE vertical - right edge */}
          <div className="absolute right-1 top-0 bottom-0 flex items-center" style={{ zIndex: 1 }}>
            <span style={{
              writingMode: 'vertical-rl',
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 9,
              letterSpacing: '0.2em',
              color: '#1a1a1a',
              textTransform: 'uppercase'
            }}>PROGRAMMING_LIFE</span>
          </div>

          {/* Bottom status in panel */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-orange-500/10 px-3 py-1.5">
            <div className="flex items-center gap-2">
              <span className={`hud-dot ${statusDot}`} style={{ width: 6, height: 6 }} />
              <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 9, color: '#4b5563', letterSpacing: '0.15em' }}>
                {statusLabel}
              </span>
            </div>
          </div>
          </div>
        </div>

        {/* ── CENTER AREA (Locked to 100vh height, responsive scaling) ── */}
        <div className={`flex-1 flex-col items-center justify-between py-3 px-6 h-full overflow-hidden ${
          activeMobileTab === 'timer' ? 'flex w-full' : 'hidden lg:flex'
        }`} style={{ minWidth: 0 }}>

          {/* Large ring + avatar ── Responsive size */}
          <div className="relative flex items-center justify-center my-auto"
            style={{
              width: 'clamp(280px, 52vh, 400px)',
              height: 'clamp(280px, 52vh, 400px)'
            }}>

            <svg viewBox="0 0 340 340" className="absolute inset-0 w-full h-full"
              style={{ filter: 'drop-shadow(0 0 4px rgba(var(--accent-rgb),0.2))' }}>
              {/* Outer glow ring */}
              <circle cx="170" cy="170" r="155" fill="none" stroke="rgba(var(--accent-rgb),0.03)" strokeWidth="20" />
              {/* Track */}
              <circle cx="170" cy="170" r="140" fill="none" stroke="rgba(var(--accent-rgb),0.08)" strokeWidth="14" />
              {/* 48 tick marks */}
              {Array.from({ length: 48 }).map((_, i) => {
                const angle = (i / 48) * 360 - 90
                const rad = angle * Math.PI / 180
                const isMajor = i % 6 === 0
                const r1 = 140 - (isMajor ? 10 : 6)
                const r2 = 140 + (isMajor ? 4 : 2)
                return (
                  <line
                    key={i}
                    x1={170 + r1 * Math.cos(rad)} y1={170 + r1 * Math.sin(rad)}
                    x2={170 + r2 * Math.cos(rad)} y2={170 + r2 * Math.sin(rad)}
                    stroke={isMajor ? 'rgba(var(--accent-rgb),0.25)' : 'rgba(var(--accent-rgb),0.1)'}
                    strokeWidth={isMajor ? 1.5 : 0.8}
                  />
                )
              })}
              {/* Progress arc */}
              <motion.circle
                cx="170" cy="170" r={R}
                fill="none" stroke="var(--accent)" strokeWidth="12" strokeLinecap="butt"
                strokeDasharray={`${ringDash} ${CIRC}`}
                strokeDashoffset={0}
                transform="rotate(-90 170 170)"
                initial={{ strokeDasharray: `0 ${CIRC}` }}
                animate={{ strokeDasharray: `${ringDash} ${CIRC}` }}
                transition={{ duration: 1.6, ease: 'easeOut' }}
                style={{ filter: 'drop-shadow(0 0 8px rgba(var(--accent-rgb),0.9)) drop-shadow(0 0 20px rgba(var(--accent-rgb),0.4))' }}
              />
              {/* Inner decorative ring */}
              <circle cx="170" cy="170" r="122" fill="none" stroke="rgba(var(--accent-rgb),0.05)" strokeWidth="1" />
              <circle cx="170" cy="170" r="115" fill="none" stroke="rgba(var(--accent-rgb),0.03)" strokeWidth="1" />
            </svg>

            {/* Avatar button */}
            <motion.button
              onClick={onStart}
              className="relative rounded-full overflow-hidden cursor-pointer z-10"
              style={{
                width: 'clamp(180px, 34vh, 260px)',
                height: 'clamp(180px, 34vh, 260px)'
              }}
              animate={{ scale: [1, 1.012, 1] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
            >
              <img
                src="https://i.pinimg.com/originals/57/52/1e/57521e44486b536872c9416c465e9079.gif"
                alt="Iniciar sesión"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 rounded-full"
                style={{ boxShadow: 'inset 0 0 40px rgba(var(--accent-rgb),0.25), inset 0 0 80px rgba(0,0,0,0.4)' }} />
              <div className="absolute inset-0 rounded-full"
                style={{ border: '2px solid rgba(var(--accent-rgb),0.5)', boxShadow: '0 0 20px rgba(var(--accent-rgb),0.3)' }} />
            </motion.button>
          </div>

          {/* Controls section - tightly stacked to save height */}
          <div className="flex flex-col items-center gap-1.5 w-full mt-auto">

            {/* Status */}
            <div className="flex items-center gap-2">
              <span className="hud-label" style={{ fontSize: 10, letterSpacing: '0.3em', color: 'rgba(var(--accent-rgb),0.5)' }}>// STATUS:</span>
              <span className={`hud-dot ${statusDot}`} />
              <span className="hud-title animate-pulse" style={{ fontSize: 14, letterSpacing: '0.22em', color: 'var(--accent)' }}>{statusLabel}</span>
            </div>

            {/* Hours / goal */}
            <div className="flex items-baseline gap-1.5">
              <span className="hud-number" style={{ fontSize: 32 }}>{todayHours.toFixed(1)}</span>
              {editingGoal ? (
                <div className="flex items-center gap-1">
                  <span className="hud-label text-xs">/</span>
                  <input
                    type="number" min="0.5" max="24" step="0.5"
                    value={goalInput}
                    onChange={e => setGoalInput(e.target.value)}
                    onBlur={handleGoalSave}
                    onKeyDown={e => e.key === 'Enter' && handleGoalSave()}
                    autoFocus
                    className="w-12 text-center font-bold bg-neutral-900 border border-orange-500/40 text-orange-400 focus:outline-none px-1"
                    style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12 }}
                  />
                  <span className="hud-label text-xs">H</span>
                </div>
              ) : (
                <button
                  onClick={() => { setGoalInput(String(dailyGoal)); setEditingGoal(true) }}
                  className="flex items-center gap-1 group hover:text-orange-400 transition-colors"
                >
                  <span className="hud-label text-xs">/ {dailyGoal}H</span>
                  <span className="group-hover:opacity-60 opacity-0 transition-opacity text-orange-500" style={{ fontSize: 9 }}>✏</span>
                </button>
              )}
            </div>

            {/* Level seg bar */}
            <div style={{ width: '100%', maxWidth: 340 }} className="mb-0.5">
              <div className="flex items-center justify-between mb-0.5">
                <span className="hud-label text-[9px]">{`>> NIVEL_${currentLevel.toString().padStart(2, '0')} — ${currentRank.kanji} ${currentRank.name}`}</span>
                <span className="hud-label text-[9px]">{Math.round(progressToNext)}%</span>
              </div>
              <SegBar total={14} filled={Math.round((progressToNext / 100) * 14)} />
            </div>

            {!done && (
              <p className="hud-label mb-2" style={{ fontSize: 9, color: 'rgba(var(--accent-rgb),0.6)' }}>
                {remH > 0 ? `${remH}H ${remM}M RESTANTES` : `${remM}M RESTANTES`}
              </p>
            )}

            {/* ── MAIN CTA BUTTON ──── angular HUD style */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={onStart}
              className="mb-2 hud-glow-orange"
              style={{
                width: '100%',
                maxWidth: 340,
                background: 'rgba(var(--accent-rgb),0.06)',
                border: '1px solid rgba(var(--accent-rgb),0.5)',
                clipPath: 'polygon(10px 0%, calc(100% - 10px) 0%, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0% calc(100% - 10px), 0% 10px)',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer'
              }}
            >
              <div className="hud-stripe" style={{ height: 3 }} />
              <div style={{
                padding: '10px 20px',
                fontFamily: "'Rajdhani', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: '0.18em',
                color: 'var(--accent)',
                textAlign: 'center'
              }}>
                &gt;&gt; ¿POR QUÉ HAGO ESTO?
              </div>
            </motion.button>

            {/* ── QUICK START BUTTON ── kanji style from image 2 */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={onQuickStart}
              style={{
                width: '100%',
                maxWidth: 340,
                background: 'rgba(0,0,0,0.85)',
                border: '1px solid rgba(var(--accent-rgb),0.35)',
                clipPath: 'polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px)',
                overflow: 'hidden',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'stretch'
              }}
            >
              {/* Kanji box — 起動 means "launch/start" */}
              <div style={{
                background: 'rgba(var(--accent-rgb),0.15)',
                borderRight: '1px solid rgba(var(--accent-rgb),0.3)',
                padding: '8px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontFamily: 'serif', fontSize: 20, color: 'var(--accent)', lineHeight: 1, textShadow: '0 0 10px rgba(var(--accent-rgb),0.6)' }}>起動</span>
              </div>
              {/* Text */}
              <div style={{
                flex: 1,
                padding: '8px 14px',
                display: 'flex',
                alignItems: 'center',
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 11,
                letterSpacing: '0.1em',
                color: 'rgba(var(--accent-rgb),0.7)'
              }}>
                // INICIO RÁPIDO — 25 MIN
              </div>
            </motion.button>
          </div>
        </div>

        {/* ── RIGHT PANELS (Scrollable sidebar on small screen heights) ── */}
        <div className={`flex-col gap-2 p-2 shrink-0 h-full overflow-y-auto ${
          activeMobileTab === 'stats' ? 'flex w-full items-center px-4 py-4' : 'hidden lg:flex'
        }`} style={{ width: activeMobileTab === 'stats' ? '100%' : 'clamp(200px, 22vw, 250px)' }}>
          <div className="w-full max-w-[340px] flex flex-col gap-3">

          {/* RACHA_DIARIA [MOD-01] (Matches mockup image 1 layout) */}
          <HudPanel title="RACHA_DIARIA" mod="MOD-01" id="0004-4-99" dotStatus={currentStreak > 0 ? 'active' : 'standby'}>
            <p className="hud-label text-[9px] mb-0.5">RACHA ACTUAL</p>
            <p className="hud-number" style={{ fontSize: 26, lineHeight: 1.1 }}>
              {currentStreak}<span style={{ fontSize: 12, opacity: 0.6, marginLeft: 2 }}>DÍAS</span>
            </p>
            <p className="hud-label text-[9px] mt-1 mb-2.5" style={{ color: 'rgba(var(--accent-rgb),0.5)' }}>
              {currentStreak > 0 ? `▲ +${currentStreak} días vs sem. anterior` : '○ SIN ACTIVIDAD REGISTRADA'}
            </p>
            
            {/* L M X J V S D week flames (Matches mockup design) */}
            <div className="flex gap-1 justify-between px-1">
              {days.map((d, i) => (
                <div key={d} className="flex flex-col items-center gap-1">
                  <span className="hud-label" style={{ fontSize: 8, color: i === todayDow ? 'var(--accent)' : '#4b5563', fontWeight: i === todayDow ? 700 : 400 }}>{d}</span>
                  {activeDaysThisWeek[i] ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" className="filter drop-shadow-[0_0_4px_var(--accent)]">
                      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3.5z" fill="var(--accent)"/>
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1f2937" strokeWidth="2">
                      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3.5z"/>
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </HudPanel>


          <HudPanel title="HECHO_ESTA_SEM" mod="MOD-02" id="0048-4-02" dotStatus="standby">
            <div className="space-y-1">
              {recentSessions.length === 0 ? (
                <p className="hud-label text-[9px]">Sin sesiones aún</p>
              ) : (
                recentSessions.map((s, i) => (
                  <div key={s.id || i} className="flex items-center gap-1.5">
                    <span style={{ color: 'var(--accent)', fontSize: 8 }}>▶</span>
                    <span className="hud-label text-[9px] truncate" style={{ color: '#6b7280', maxWidth: 120 }}>
                      {s.projectEmoji} {s.projectName || 'Sesión'} — {Math.round((s.duration || 0) / 60)}m
                    </span>
                  </div>
                ))
              )}
            </div>
          </HudPanel>

          <HudPanel title="STATS_SEMANA" mod="MOD-03" id="0048-4-03" dotStatus={weekSessions > 0 ? 'active' : 'idle'}>
            <div className="space-y-2">
              <div>
                <p className="hud-label text-[9px] mb-0.5">Sesiones</p>
                <p className="hud-number" style={{ fontSize: 20 }}>{weekSessions}</p>
              </div>
              <div>
                <p className="hud-label text-[9px] mb-0.5">Horas totales</p>
                <p className="hud-number" style={{ fontSize: 20 }}>{weekHours}<span style={{ fontSize: 10 }}>H</span></p>
              </div>
              <div>
                <p className="hud-label text-[9px] mb-1">Distribución</p>
                <div className="flex gap-0.5 items-end" style={{ height: 24 }}>
                  {[10, 11, 12, 15, 16, 17, 21, 22].map((h, i) => {
                    const h2 = getLocalYMDH(new Date(new Date().setHours(h, 0, 0, 0)))
                    const count = (history || []).filter(e => getLocalYMDH(e.date) === h2).length
                    const barH = Math.max(4, Math.min(24, count * 8 + 4))
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center justify-end">
                        <div style={{ height: barH, background: count > 0 ? 'var(--accent)' : 'rgba(var(--accent-rgb),0.1)', width: '100%' }} />
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </HudPanel>

          <HudPanel title="RANGO" mod="MOD-04" id="0048-4-04" dotStatus={done ? 'active' : 'idle'}>
            <div className="flex items-center gap-2 mb-1">
              <span style={{ fontSize: 24, lineHeight: 1 }}>{currentRank.symbol}</span>
              <div>
                <p className="hud-title text-white text-xs">{currentRank.name}</p>
                <p className="hud-label text-[9px]">{currentRank.kanjiName}</p>
              </div>
            </div>
            <p className="hud-label text-[9px] mb-1" style={{ color: '#4b5563' }}>{currentRank.title}</p>
            <SegBar total={10} filled={Math.round((progressToNext / 100) * 10)} />
          </HudPanel>
          </div>
        </div>
      </div>

      {/* ── BOTTOM STATUS BAR ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 h-[30px] shrink-0 border-t border-orange-500/10"
        style={{ background: 'rgba(0,0,0,0.7)', fontFamily: "'Share Tech Mono', monospace" }}>
        <div className="flex gap-4">
          {[
            { label: 'INACTIVO', active: statusLabel === 'INACTIVO' },
            { label: 'EN CURSO', active: false },
            { label: 'ACUMULANDO', active: statusLabel === 'ACUMULANDO', bold: true },
            { label: 'ALTA CARGA', active: pct >= 0.8 },
          ].map(s => (
            <span key={s.label} className="text-[9px] tracking-widest"
              style={{ color: s.active ? 'var(--accent)' : '#374151', fontWeight: s.active && s.bold ? 700 : 400 }}>
              {s.label}
            </span>
          ))}
        </div>
        <div className="flex gap-3 items-center">
          <span className="text-[9px]" style={{ color: '#374151' }}>
            SYSTEM_TIME: {now.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <span className="text-[9px]" style={{ color: '#374151' }}>STATE: {statusLabel}</span>
          <span style={{ fontSize: 9, color: 'rgba(var(--accent-rgb),0.4)' }}>Optimizado para TDAH ✦</span>
        </div>
      </div>
    </motion.div>
  )
}
