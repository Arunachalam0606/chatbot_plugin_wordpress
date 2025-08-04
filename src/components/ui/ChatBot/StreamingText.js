import { motion } from 'framer-motion'

const StreamingText = ({ text, isStreaming }) => {
  return (
    <motion.div
      initial={{ opacity: 0.8, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: isStreaming ? 0.1 : 0.24, ease: 'easeInOut' }}
      className="w-full text-left leading-relaxed"
    >
      <div className="whitespace-pre-wrap break-words">
        {text}
        {isStreaming && <span className="animate-pulse ml-1">▏</span>}
      </div>
    </motion.div>
  )
}

export default StreamingText
