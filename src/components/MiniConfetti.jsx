import { motion } from 'framer-motion'

// 5.5 MINI CONFETTI FOR REWARDS
export default function MiniConfetti() {
  const pieces = Array.from({ length: 50 })
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-50">
      {pieces.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{ backgroundColor: ['#F59E0B', '#3B82F6', '#10B981', '#EF4444', '#8B5CF6'][i % 5] }}
          initial={{ x: 0, y: 0, scale: 0 }}
          animate={{
            x: (Math.random() - 0.5) * 400,
            y: (Math.random() - 0.5) * 400 - 100,
            scale: [0, 1.5, 0],
            opacity: [1, 1, 0]
          }}
          transition={{ duration: 1 + Math.random(), ease: "easeOut" }}
        />
      ))}
    </div>
  )
}
