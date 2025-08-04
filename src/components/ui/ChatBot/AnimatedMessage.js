import { motion, AnimatePresence } from 'framer-motion'
import { User } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import StreamingText from '@/components/ui/ChatBot/StreamingText'

const AnimatedMessage = ({ message, shouldShowTypingIndicator, companyLogo }) => {
  if (message.isFromBot && !message.text && shouldShowTypingIndicator) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: 10 }}
      transition={{ duration: 0.33, type: 'spring', bounce: 0.08 }}
    >
      <div className={cn('flex gap-3', message.isFromBot ? 'justify-start items-start' : 'justify-end items-start')}>
        {message.isFromBot && (
          <Image
            width={100}
            height={100}
            src={companyLogo}
            className="w-10 h-10 rounded-full bg-white p-1 flex-shrink-0 mt-0"
            alt="Bot avatar"
          />
        )}

        <div className="flex flex-col items-start min-w-0 max-w-[80vw] sm:max-w-[75%]">
          {message.text && (
            <div
              className={cn(
                'px-4 py-3 rounded-xl shadow-sm text-base sm:text-sm relative min-w-0 w-full',
                message.isFromBot
                  ? 'bg-blue-950/80 text-blue-100 border border-blue-900 rounded-bl-sm'
                  : 'bg-blue-600 text-white rounded-br-sm'
              )}
              style={{
                overflowWrap: 'break-word',
                wordBreak: 'break-word',
                lineHeight: '1.5',
                maxWidth: '100%'
              }}
            >
              <AnimatePresence mode="wait">
                <StreamingText key={message.id} text={message.text} isStreaming={message.isStreaming} />
              </AnimatePresence>

              <div className="text-xs opacity-60 mt-2 text-left">{message.timestamp}</div>
            </div>
          )}
        </div>

        {!message.isFromBot && (
          <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0 mt-0">
            <User className="w-5 h-5 text-gray-200" />
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default AnimatedMessage
