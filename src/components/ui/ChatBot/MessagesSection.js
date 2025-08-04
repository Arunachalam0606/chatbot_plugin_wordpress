import { motion } from 'framer-motion'
import AnimatedMessage from './AnimatedMessage'
import SuggestionChip from './SuggestionChip'
import BotTypingIndicator from './BotTypingIndicator'
import Image from 'next/image'

const MessagesSection = ({
  chatMessages,
  areSuggestionsVisible,
  currentTranslation,
  isBotCurrentlyStreaming,
  isBotTypingIndicatorVisible,
  onSendMessage,
  messagesEndRef,
  companyLogo
}) => {
  return (
    <section className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
      {chatMessages.map((message, messageIndex) => {
        const shouldShowTypingIndicator =
          isBotCurrentlyStreaming &&
          message.isFromBot &&
          messageIndex === chatMessages.length - 1 &&
          isBotTypingIndicatorVisible &&
          !message.text

        return (
          <AnimatedMessage
            key={message.id}
            message={message}
            shouldShowTypingIndicator={shouldShowTypingIndicator}
            companyLogo={companyLogo}
          />
        )
      })}

      {/* Independent thinking bubble when bot is waiting and no text yet */}
      {isBotCurrentlyStreaming &&
        isBotTypingIndicatorVisible &&
        chatMessages.length > 0 &&
        chatMessages[chatMessages.length - 1].isFromBot &&
        chatMessages[chatMessages.length - 1].text === '' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.33, type: 'spring', bounce: 0.08 }}
            className="flex gap-3 justify-start items-start"
          >
            <Image
              width={100}
              height={100}
              src={companyLogo}
              className="w-10 h-10 rounded-full bg-white p-1 flex-shrink-0 mt-0"
              alt="Bot avatar"
            />
            <BotTypingIndicator />
          </motion.div>
        )}

      {/* Quick Suggestions */}
      {areSuggestionsVisible && chatMessages.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
          <div className="flex items-center mb-3">
            <span className="mr-1 text-lg">💡</span>
            <p className="text-base sm:text-sm text-blue-300">{currentTranslation.quickSuggestions}</p>
          </div>

          <div className="flex flex-wrap">
            {currentTranslation.placeholders.slice(1, 5).map((suggestion, suggestionIndex) => (
              <SuggestionChip key={suggestionIndex} text={suggestion} onChipClick={onSendMessage} />
            ))}
          </div>
        </motion.div>
      )}
      <div ref={messagesEndRef} />
    </section>
  )
}

export default MessagesSection
