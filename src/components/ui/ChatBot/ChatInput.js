import { useState, useRef, useEffect } from 'react'
import { Send, Smile } from 'lucide-react'
import { cn } from '@/lib/utils'
import PlaceholdersAndVanishInput from './PlaceholdersAndVanishInput'
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'

const ChatInput = ({ inputMessage, setInputMessage, onSendMessage, isBotStreaming, placeholders }) => {
  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false)
  const emojiPickerRef = useRef(null)

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setIsEmojiPickerVisible(false)
      }
    }

    if (isEmojiPickerVisible) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isEmojiPickerVisible])

  // Close emoji picker on escape key
  useEffect(() => {
    const handleEscapeKey = event => {
      if (event.key === 'Escape' && isEmojiPickerVisible) {
        setIsEmojiPickerVisible(false)
      }
    }

    document.addEventListener('keydown', handleEscapeKey)
    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isEmojiPickerVisible])

  const handleEmojiSelect = emoji => {
    setInputMessage(currentInput => currentInput + emoji.native)
    setIsEmojiPickerVisible(false)
  }

  const toggleEmojiPicker = () => {
    if (!isBotStreaming) {
      setIsEmojiPickerVisible(current => !current)
    }
  }

  return (
    <footer className="px-3 sm:px-4 py-4 bg-[#1a1f26] rounded-b-2xl border-t border-blue-900/30 w-full">
      <div className="flex items-center gap-2 bg-[#0f1419] rounded-full px-3 py-2">
        <div className="relative flex-shrink-0">
          <button
            type="button"
            className={cn(
              'p-2 rounded-full transition-colors',
              isBotStreaming ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-700 cursor-pointer'
            )}
            disabled={isBotStreaming}
            onClick={toggleEmojiPicker}
            aria-label="Open emoji picker"
          >
            <Smile className="w-5 h-5 text-gray-400" />
          </button>

          {isEmojiPickerVisible && (
            <div ref={emojiPickerRef} className="absolute bottom-16 left-0 z-50 shadow-2xl rounded-lg overflow-hidden">
              <Picker
                data={data}
                onEmojiSelect={handleEmojiSelect}
                theme="dark"
                set="native"
                showPreview={false}
                showSkinTones={true}
                emojiButtonSize={32}
                emojiSize={20}
                maxFrequentRows={2}
                perLine={8}
                searchPosition="none"
                navPosition="bottom"
                previewPosition="none"
              />
            </div>
          )}
        </div>

        <PlaceholdersAndVanishInput
          value={inputMessage}
          onChange={event => setInputMessage(event.target.value)}
          onSubmit={onSendMessage}
          disabled={isBotStreaming}
          placeholders={placeholders}
        />

        <button
          onClick={() => onSendMessage()}
          disabled={!inputMessage.trim() || isBotStreaming}
          className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </footer>
  )
}

export default ChatInput
