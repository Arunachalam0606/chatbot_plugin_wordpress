import { motion } from 'framer-motion'

const BotTypingIndicator = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.97 }}
      transition={{ duration: 0.25 }}
      className="flex items-center justify-start gap-1 px-3 py-2 mt-2 w-fit"
      aria-label="Bot is thinking"
    >
      <span className="block w-2 h-2 rounded-full bg-blue-300 animate-bounce" />
      <span className="block w-2 h-2 rounded-full bg-blue-300 animate-bounce" style={{ animationDelay: '0.14s' }} />
      <span className="block w-2 h-2 rounded-full bg-blue-300 animate-bounce" style={{ animationDelay: '0.28s' }} />
    </motion.div>
  )
}

export default BotTypingIndicator
