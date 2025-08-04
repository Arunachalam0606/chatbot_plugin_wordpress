import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const FloatingSuggestionTooltip = ({ suggestions, displayInterval = 3000, onSuggestionClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isCurrentlyTyping, setIsCurrentlyTyping] = useState(true)

  useEffect(() => {
    let characterIndex = 0
    setDisplayedText('')
    setIsCurrentlyTyping(true)
    const currentSuggestion = suggestions[currentIndex]

    const typingInterval = setInterval(() => {
      characterIndex++
      setDisplayedText(currentSuggestion.slice(0, characterIndex))

      if (characterIndex === currentSuggestion.length) {
        clearInterval(typingInterval)
        setIsCurrentlyTyping(false)

        setTimeout(() => {
          setCurrentIndex(previousIndex => (previousIndex + 1) % suggestions.length)
          setIsCurrentlyTyping(true)
        }, displayInterval - 400)
      }
    }, 35)

    return () => clearInterval(typingInterval)
  }, [currentIndex, suggestions, displayInterval])

  return (
    <div className="fixed bottom-[98px] right-4 sm:right-6 z-40 select-none">
      <motion.div
        className={cn(
          'flex items-center bg-gradient-to-br from-blue-900 via-blue-950 to-gray-900 text-white shadow-xl rounded-xl py-2 px-4 max-w-xs min-w-[135px] border border-zinc-900 font-mono font-medium text-base sm:text-sm'
        )}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        style={{ cursor: isCurrentlyTyping ? 'default' : 'pointer' }}
        onClick={() => !isCurrentlyTyping && onSuggestionClick(suggestions[currentIndex])}
        tabIndex={0}
        role="button"
        onKeyDown={keyboardEvent => {
          if (!isCurrentlyTyping && (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ')) {
            onSuggestionClick(suggestions[currentIndex])
          }
        }}
      >
        <span className="mr-1 text-lg">💡</span>
        <span>
          {displayedText}
          {isCurrentlyTyping && <span className="ml-[1px] animate-pulse">▏</span>}
        </span>
      </motion.div>
    </div>
  )
}

export default FloatingSuggestionTooltip
