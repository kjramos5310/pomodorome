import { motion } from 'framer-motion'

// Stats Card Component
export default function StatsCard({ icon, value, label, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-neutral-850/50 p-6 rounded-2xl"
    >
      <div className={`${color} mb-3`}>{icon}</div>
      <div className="text-4xl font-bold mb-1">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </motion.div>
  )
}
