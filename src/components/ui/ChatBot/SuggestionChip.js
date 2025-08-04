import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const SuggestionChip = ({ text, onChipClick }) => {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      onClick={() => onChipClick(text)}
      className={cn(
        'inline-block px-3 py-2 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm mr-2 mb-2 cursor-pointer border border-blue-900',
        'bg-blue-950/80 hover:bg-blue-900 text-blue-100 transition-all duration-200 transform hover:scale-105'
      )}
      tabIndex={0}
      role="button"
      onKeyDown={keyboardEvent => {
        if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
          onChipClick(text)
        }
      }}
    >
      {text}
    </motion.button>
  )
}

export default SuggestionChip
