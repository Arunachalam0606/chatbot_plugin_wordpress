import Image from 'next/image'
import { X, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import LanguageSwitcher from '@/components/LanguageSwitcher'

const ChatHeader = ({
  currentLanguage,
  onLanguageChange,
  onClose,
  onNewChat,
  currentTranslation,
  isBotStreaming,
  companyLogo
}) => {
  return (
    <section
      className={cn(
        'flex items-center gap-3 px-4 sm:px-6 py-4 rounded-t-2xl border-b border-blue-900/60 shadow-xl w-full',
        'bg-gradient-to-br from-blue-900 via-blue-950 to-gray-900 text-blue-100'
      )}
    >
      <Image
        width={100}
        height={100}
        src={companyLogo}
        className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white p-1 flex-shrink-0"
        alt="Company logo"
      />
      <div className="flex-1 min-w-0">
        <h1 className="text-base sm:text-lg font-semibold truncate tracking-wide">
          {currentTranslation.assistantTitle}
        </h1>
      </div>

      <div className="relative group">
        <button
          className={cn(
            'p-2 rounded-full flex-shrink-0 transition-colors',
            isBotStreaming ? 'cursor-not-allowed opacity-50' : 'hover:bg-blue-900/40 cursor-pointer'
          )}
          onClick={onNewChat}
          disabled={isBotStreaming}
          aria-label="Start new chat"
        >
          <Plus className="w-5 h-5 text-blue-200" />
        </button>
        <div className="absolute invisible group-hover:visible bg-gray-900 text-white text-sm px-2 py-1 rounded -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          New Chat
        </div>
      </div>

      <div className="relative group">
        <LanguageSwitcher
          currentLanguage={currentLanguage}
          onLanguageChange={onLanguageChange}
          disabled={isBotStreaming}
        />
        <div className="absolute invisible group-hover:visible bg-gray-900 text-white text-sm px-2 py-1 rounded -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          Change Language
        </div>
      </div>

      <div className="relative group">
        <button
          className="p-2 hover:bg-blue-900/40 rounded-full flex-shrink-0"
          onClick={onClose}
          aria-label="Close chat"
        >
          <X className="w-5 h-5 text-blue-200" />
        </button>
        <div className="absolute invisible group-hover:visible bg-gray-900 text-white text-sm px-2 py-1 rounded -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          Close Chat
        </div>
      </div>
    </section>
  )
}

export default ChatHeader
