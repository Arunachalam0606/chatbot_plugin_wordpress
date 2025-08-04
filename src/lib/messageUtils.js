/**
 * Generate unique message ID
 * @param {string} prefix - Prefix for the ID
 * @returns {string} Unique message ID
 */
export const generateMessageId = (prefix = 'msg') => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Format timestamp for messages
 * @param {Date} date - Date object
 * @param {string} locale - Locale string (optional)
 * @returns {string} Formatted time string
 */
export const formatMessageTimestamp = (date = new Date(), locale = 'en-US') => {
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

/**
 * Create message object
 * @param {Object} options - Message options
 * @returns {Object} Message object
 */
export const createMessage = ({
  id,
  text,
  isFromBot = false,
  isStreaming = false,
  timestamp = new Date(),
  locale = 'en-US'
}) => {
  return {
    id: id || generateMessageId(),
    text,
    isFromBot,
    isStreaming,
    timestamp: typeof timestamp === 'string' ? timestamp : formatMessageTimestamp(timestamp, locale)
  }
}

/**
 * Process chat history from API
 * @param {Array} messages - Raw messages from API
 * @returns {Array} Processed messages
 */
export const processChatHistory = messages => {
  if (!Array.isArray(messages)) return []

  const processedMessages = []

  messages.forEach((message, index) => {
    if (message.user_message) {
      processedMessages.push(
        createMessage({
          id: `history-user-${index}`,
          text: message.user_message,
          isFromBot: false,
          timestamp: message.timestamp ? new Date(message.timestamp) : new Date()
        })
      )
    }

    if (message.bot_response) {
      processedMessages.push(
        createMessage({
          id: `history-bot-${index}`,
          text: message.bot_response,
          isFromBot: true,
          timestamp: message.timestamp ? new Date(message.timestamp) : new Date()
        })
      )
    }
  })

  return processedMessages
}
