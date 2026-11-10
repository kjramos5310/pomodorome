import { motion } from 'framer-motion'

// 0. LEVEL UP MODAL
export default function LevelUpModal({ level, rank, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.5, y: 50 }}
        className="bg-neutral-900 border border-gold-500/30 p-8 rounded-3xl max-w-sm w-full text-center relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent opacity-50" />

        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-6xl mb-4"
        >
          🎉
        </motion.div>

        <h2 className="text-3xl font-bold text-white mb-2">¡NIVEL {level}!</h2>
        <p className="text-gold-400 font-medium mb-6">Has ascendido a {rank.name}</p>

        {/* Level Up GIF */}
        <div className="w-48 h-48 mx-auto rounded-full overflow-hidden mb-6 border-4 border-gold-500 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
          <img
            src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHlpeGJ2MmEyamJodXh5ZHZhZzlvMWFmbDRpYXM1MjMyZjl1YzhwayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3nyIj1d1igD4SGhVvu/giphy.gif"
            alt="Level Up"
            className="w-full h-full object-cover"
          />
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-gold-500 hover:bg-gold-600 text-black font-bold rounded-xl transition-colors"
        >
          ¡VAMOS!
        </button>
      </motion.div>
    </motion.div>
  )
}
