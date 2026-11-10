import { useState } from 'react'
import { motion } from 'framer-motion'

// 3. DEEPWORK CONFIG SCREEN
export default function DeepworkConfigScreen({ mood, suggestedCount, onStart, moodColors, countOptions }) {
  const [count, setCount] = useState(suggestedCount)
  const [duration, setDuration] = useState(25) // 25 min default

  const options = countOptions ?? [1, 2, 3, 4, 5, 6]
  const durationOptions = [15, 25, 45, 60]

  // 🎞️ Pon aquí tus links de GIFs para cada número de deepworks
  const gifsByCount = {
    1: 'https://i.pinimg.com/originals/b3/0a/b3/b30ab33eb2d57ca6cfe93059c830fc58.gif', // reemplaza con tu link
    2: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExZGd6MTN2enQ1dGlvNG9nZHBxazI5cGhmMzNlZG02cXhhbmh3djNnNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/hP9gy6aTMyle7e5pbS/giphy.gif',
    3: 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExNm45ODN2a2ZxdDRoaGE4NmUxM2w4OTh1cnQ3dzNvazczNWkzNGE2MCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/2vkmQBB91NUTolPSd2/giphy.gif',
    4: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXg3a2kyMmg1NjZsM3ByZjlsbmlzajZsdmszaWZrbWhhZWNvZ2hiayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/K91OXsr6lSjh5qxQBb/giphy.gif',
    5: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExaWM3NXQ4aHlzZHJxcmFvcGR5bWY3cHozdWNnMnJsb25sOXMzeWNhcSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/KqOmIBTRF7RHwvGJqA/giphy.gif',
    6: 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExMWgwcWJmaXJsOXNybzN4cGJuZWpqZmhyaTc0eXp5bnhjbXUxZWRmOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/RDen1HUlEWp6OKS15E/giphy.gif',
  }

  const currentGif = gifsByCount[count] || gifsByCount[1]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 px-8"
    >
      {/* GIF */}
      <motion.div
        key={count}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-64 h-64 rounded-3xl overflow-hidden mb-8 bg-neutral-800 shadow-2xl"
      >
        <img
          src={currentGif}
          alt={`${count} deepworks`}
          className="w-full h-full object-cover"
        />
      </motion.div>

      <div className="text-center max-w-md w-full">
        <h2 className="text-3xl font-semibold mb-2">Configura tu sesión</h2>

        {/* Count Slider */}
        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-4">Número de deepworks (Sugerido: {suggestedCount})</p>
          <div className="flex justify-center gap-3">
            {options.map((num) => (
              <button
                key={num}
                onClick={() => setCount(num)}
                className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all ${count === num
                  ? 'bg-gold-500 text-black scale-110'
                  : 'bg-neutral-800 text-gray-400 hover:bg-neutral-700'
                  }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Duration Slider */}
        <div className="mb-10 bg-neutral-850/50 p-4 rounded-3xl border border-neutral-800">
          <p className="text-gray-400 text-sm mb-4">Minutos por deepwork</p>
          <div className="flex justify-center gap-2">
            {durationOptions.map((mins) => (
              <button
                key={mins}
                onClick={() => setDuration(mins)}
                className={`flex-1 py-3 rounded-2xl font-semibold transition-all ${duration === mins
                  ? 'bg-gold-500 text-black scale-105'
                  : 'bg-neutral-800 text-gray-400 hover:bg-neutral-700'
                  }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onStart(count, duration)}
          className="w-full max-w-xs py-4 px-8 bg-gold-500 hover:bg-gold-600 text-black font-semibold rounded-full text-lg transition-colors"
        >
          COMENZAR
        </motion.button>
      </div>
    </motion.div>
  )
}
