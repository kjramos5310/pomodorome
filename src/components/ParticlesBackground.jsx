import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

// 0.5 PARTICLES BACKGROUND
export default function ParticlesBackground({ colorClass }) {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    // Generate 80 random particles (Double the amount)
    const newParticles = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 10 + 6, // 6px to 16px (Bigger)
      delay: Math.random() * 3, // Less delay
      duration: Math.random() * 8 + 10 // 10s to 18s (Faster)
    }))
    setParticles(newParticles)
  }, [])

  // Mapeo manual para evitar que Tailwind purgue las clases generadas dinámicamente
  const bgMap = {
    'text-gray-500': 'bg-gray-500 shadow-gray-500',
    'text-red-400': 'bg-red-400 shadow-red-400',
    'text-green-400': 'bg-green-400 shadow-green-400',
    'text-purple-400': 'bg-purple-400 shadow-purple-400',
    'text-orange-400': 'bg-orange-400 shadow-orange-400',
    'text-red-600': 'bg-red-600 shadow-red-600',
    'text-blue-400': 'bg-blue-400 shadow-blue-400',
    'text-indigo-400': 'bg-indigo-400 shadow-indigo-400',
    'text-yellow-400': 'bg-yellow-400 shadow-yellow-400',
    'text-emerald-400': 'bg-emerald-400 shadow-emerald-400',
    'text-cyan-400': 'bg-cyan-400 shadow-cyan-400',
    'text-white': 'bg-white shadow-white'
  }

  const particleClass = bgMap[colorClass] || 'bg-gold-500 shadow-gold-500'

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className={`absolute rounded-full shadow-[0_0_20px_rgba(255,255,255,0.6)] ${particleClass}`}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [-20, -1000],
            x: [0, (Math.random() - 0.5) * 150],
            opacity: [0, 1, 0], // Higher opacity
            scale: [0.5, 2, 0.5] // More dramatic pulsing
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeIn" // Accelerates as they go up
          }}
        />
      ))}
    </div>
  )
}
