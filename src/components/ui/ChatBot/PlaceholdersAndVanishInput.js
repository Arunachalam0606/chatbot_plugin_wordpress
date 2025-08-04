import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const PlaceholdersAndVanishInput = ({ value, onChange, onSubmit, disabled, placeholders }) => {
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (!value) {
      const placeholderInterval = setInterval(() => {
        setIsAnimating(true)
        setTimeout(() => {
          setCurrentPlaceholder(previousIndex => (previousIndex + 1) % placeholders.length)
          setIsAnimating(false)
        }, 500)
      }, 3000)
      return () => clearInterval(placeholderInterval)
    }
  }, [value, placeholders])

  return (
    <div className="flex-1 relative min-w-0">
      <textarea
        value={value}
        onChange={onChange}
        onKeyDown={keyboardEvent => {
          if (keyboardEvent.key === 'Enter' && !keyboardEvent.shiftKey) {
            keyboardEvent.preventDefault()
            onSubmit()
          }
        }}
        rows={1}
        className={cn(
          'flex-1 w-full bg-transparent resize-none text-base sm:text-sm text-white outline-none px-3 pt-2 pb-0 max-h-40 leading-5',
          'scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent text-left'
        )}
        style={{
          paddingBottom: 0,
          textAlign: 'left',
          direction: 'ltr'
        }}
        disabled={disabled}
        placeholder=""
      />
      {!value && (
        <div className="absolute left-3 top-0 h-full flex items-center pointer-events-none">
          <AnimatePresence mode="wait">
            {!isAnimating && (
              <motion.div
                key={currentPlaceholder}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3 }}
                className="text-base sm:text-sm text-gray-500 text-left"
              >
                {placeholders[currentPlaceholder]}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

export default PlaceholdersAndVanishInput
