'use client';

import { useState, useRef, useEffect } from 'react';
import endpoints from '@/api/api';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

import { cn } from '@/lib/utils';
import {
  generateMessageId,
  createMessage,
  processChatHistory,
} from '@/lib/messageUtils';

import FloatingSuggestionTooltip from '@/components/ui/ChatBot/FloatingSuggestionTooltip';
import ChatHeader from '@/components/ui/ChatBot/ChatHeader';
import MessagesSection from '@/components/ui/ChatBot/MessagesSection';
import ChatInput from '@/components/ui/ChatBot/ChatInput';

import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useChatSession } from '@/hooks/useChatSession';

import { translations } from '@/config/translations';

const COMPANY_LOGO = '/teldat.svg';
const CHAT_SESSION_KEY = 'teldat-chat-session';
const LANGUAGE_STORAGE_KEY = 'teldat-chat-language';

const ChatBot = () => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'en';
    }
    return 'en';
  });

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [areSuggestionsVisible, setAreSuggestionsVisible] = useState(true);
  const [isBotCurrentlyStreaming, setIsBotCurrentlyStreaming] = useState(false);
  const [isBotTypingIndicatorVisible, setIsBotTypingIndicatorVisible] =
    useState(false);

  const messagesEndRef = useRef(null);
  const chatButtonRef = useRef(null);

  useBodyScrollLock(isChatOpen);
  const { sessionId, clearSession, updateSession } =
    useChatSession(CHAT_SESSION_KEY);

  const currentTranslation = translations[currentLanguage];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLanguage);
    }
  }, [currentLanguage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const getCurrentLocale = () => {
    return currentLanguage === 'es' ? 'es-ES' : 'en-US';
  };

  const initializeChat = () => {
    const welcomeMessage = createMessage({
      id: 'welcome-message',
      text: currentTranslation.welcomeMessage,
      isFromBot: true,
      locale: getCurrentLocale(),
    });

    setChatMessages([welcomeMessage]);
    setAreSuggestionsVisible(true);
    clearSession();
  };

  const loadChatHistory = async () => {
    const currentSessionId = endpoints.chat.getCurrentSessionId();

    if (currentSessionId) {
      updateSession(currentSessionId);
      try {
        const historyData = await endpoints.chat.history(currentSessionId);

        if (historyData?.messages?.length > 0) {
          const restoredMessages = processChatHistory(historyData.messages);
          setChatMessages(restoredMessages);
          setAreSuggestionsVisible(false);
          return;
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
        endpoints.chat.clearSession();
        clearSession();
      }
    }

    initializeChat();
  };

  const handleBotStreamingResponse = async (userMessage) => {
    const botMessageId = generateMessageId('bot');

    setIsBotCurrentlyStreaming(true);
    setIsBotTypingIndicatorVisible(true);

    const emptyBotMessage = createMessage({
      id: botMessageId,
      text: '',
      isFromBot: true,
      isStreaming: true,
      locale: getCurrentLocale(),
    });

    setChatMessages((previousMessages) => [
      ...previousMessages,
      emptyBotMessage,
    ]);

    let streamingTimeout;
    let accumulatedText = '';
    let latestSessionId = sessionId;
    let hasReceivedFirstChunk = false;

    const resetTypingIndicator = () => {
      setIsBotTypingIndicatorVisible(false);
      clearTimeout(streamingTimeout);
      streamingTimeout = setTimeout(() => {
        if (!hasReceivedFirstChunk) {
          setIsBotTypingIndicatorVisible(true);
        }
      }, 400);
    };

    resetTypingIndicator();

    await endpoints.chat.stream(
      {
        message: userMessage,
        session_id: sessionId,
        locale: currentLanguage,
      },
      (textChunk, newSessionId) => {
        if (!latestSessionId && newSessionId) {
          latestSessionId = newSessionId;
          updateSession(newSessionId);
        }

        hasReceivedFirstChunk = true;
        accumulatedText += textChunk;
        setIsBotTypingIndicatorVisible(false);

        setChatMessages((previousMessages) =>
          previousMessages.map((message) =>
            message.id === botMessageId
              ? { ...message, text: accumulatedText, isStreaming: true }
              : message
          )
        );
        resetTypingIndicator();
      },
      (completeText, newSessionId) => {
        setIsBotCurrentlyStreaming(false);
        setIsBotTypingIndicatorVisible(false);
        setChatMessages((previousMessages) =>
          previousMessages.map((message) =>
            message.id === botMessageId
              ? { ...message, text: completeText, isStreaming: false }
              : message
          )
        );
        clearTimeout(streamingTimeout);
        if (newSessionId && newSessionId !== sessionId) {
          updateSession(newSessionId);
        }
      },
      (error) => {
        console.error('Chat streaming error:', error);
        setIsBotCurrentlyStreaming(false);
        setIsBotTypingIndicatorVisible(false);
        setChatMessages((previousMessages) =>
          previousMessages.map((message) =>
            message.id === botMessageId
              ? {
                  ...message,
                  text: currentTranslation.errorMessage,
                  isStreaming: false,
                }
              : message
          )
        );
        clearTimeout(streamingTimeout);
      }
    );
  };

  const sendMessage = async (customMessage) => {
    const messageToSend =
      typeof customMessage === 'string' ? customMessage : inputMessage;
    if (!messageToSend.trim() || isBotCurrentlyStreaming) return;

    const userMessage = createMessage({
      id: generateMessageId('user'),
      text: messageToSend,
      isFromBot: false,
      locale: getCurrentLocale(),
    });

    setChatMessages((previousMessages) => [...previousMessages, userMessage]);
    setInputMessage('');
    setAreSuggestionsVisible(false);

    await handleBotStreamingResponse(messageToSend);
  };

  const handleChatOpen = async () => {
    setIsChatOpen(true);
    await loadChatHistory();
  };

  const handleChatClose = () => {
    setIsChatOpen(false);
    setInputMessage('');
    setIsBotCurrentlyStreaming(false);
    setIsBotTypingIndicatorVisible(false);
  };

  const handleNewChat = () => {
    if (isBotCurrentlyStreaming) return;

    endpoints.chat.clearSession();
    clearSession();
    setInputMessage('');
    setIsBotCurrentlyStreaming(false);
    setIsBotTypingIndicatorVisible(false);

    initializeChat();
  };

  const handleLanguageChange = (newLanguage) => {
    if (newLanguage === currentLanguage) return;

    endpoints.chat.clearSession();
    clearSession();

    setCurrentLanguage(newLanguage);
    setInputMessage('');

    setAreSuggestionsVisible(true);
    setIsBotCurrentlyStreaming(false);
    setIsBotTypingIndicatorVisible(false);

    setTimeout(() => {
      const welcomeMessage = createMessage({
        id: 'welcome-message',
        text: translations[newLanguage].welcomeMessage,
        isFromBot: true,
        locale: newLanguage === 'es' ? 'es-ES' : 'en-US',
      });
      setChatMessages([welcomeMessage]);
    }, 100);
  };

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      handleChatClose();
    }
  };

  const depthModalVariants = {
    initial: {
      opacity: 0,
      scale: 0.4,
      z: -100,
      rotateX: 10,
      transformPerspective: 800,
    },
    animate: {
      opacity: 1,
      scale: 1,
      z: 0,
      rotateX: 0,
      transformPerspective: 800,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
        scale: {
          duration: 0.45,
          ease: [0.34, 1.56, 0.64, 1],
        },
        opacity: {
          duration: 0.3,
          ease: 'easeOut',
        },
        z: {
          duration: 0.4,
          ease: [0.25, 0.46, 0.45, 0.94],
        },
        rotateX: {
          duration: 0.35,
          ease: 'easeOut',
        },
      },
    },
    exit: {
      opacity: 0,
      scale: 0.5,
      z: -80,
      rotateX: -8,
      transition: {
        duration: 0.25,
        ease: [0.76, 0, 0.24, 1],
      },
    },
  };

  return (
    <>
      {!isChatOpen && (
        <>
          <motion.button
            ref={chatButtonRef}
            onClick={handleChatOpen}
            className={cn(
              'fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-lg flex items-center justify-center z-50 bg-white'
            )}
            whileHover={{
              scale: 1.1,
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            }}
            whileTap={{ scale: 0.9 }}
            transition={{
              type: 'spring',
              damping: 15,
              stiffness: 400,
            }}
            aria-label='Open chat'
          >
            <Image
              width={100}
              height={100}
              src={COMPANY_LOGO}
              className='w-8 h-8'
              alt='Company logo'
            />
          </motion.button>
          <FloatingSuggestionTooltip
            suggestions={currentTranslation.placeholders}
            displayInterval={3000}
            onSuggestionClick={sendMessage}
          />
        </>
      )}

      <AnimatePresence mode='wait'>
        {isChatOpen && (
          <motion.div
            className='fixed inset-0 z-50 flex items-center justify-center'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <motion.div
              className='absolute inset-0 bg-black/60 backdrop-blur-xl'
              style={{
                WebkitBackdropFilter: 'blur(18px)',
                backdropFilter: 'blur(18px)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: 'easeOut',
              }}
              onClick={handleBackdropClick}
            />

            <div className='flex flex-1 justify-center items-center w-full h-full p-4 relative z-10'>
              <motion.div
                variants={depthModalVariants}
                initial='initial'
                animate='animate'
                exit='exit'
                className='w-full max-w-[96vw] sm:max-w-md md:max-w-2xl h-[92vh] max-h-[99svh] sm:h-[90vh] md:h-[820px] bg-[#0f1419] rounded-2xl border border-blue-900/40 shadow-2xl flex flex-col mx-auto overflow-hidden'
                style={{
                  transformOrigin: 'center center',
                  transformStyle: 'preserve-3d',
                  willChange: 'transform, opacity',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <ChatHeader
                  currentLanguage={currentLanguage}
                  onLanguageChange={handleLanguageChange}
                  onClose={handleChatClose}
                  onNewChat={handleNewChat}
                  currentTranslation={currentTranslation}
                  isBotStreaming={isBotCurrentlyStreaming}
                  companyLogo={COMPANY_LOGO}
                />

                <MessagesSection
                  chatMessages={chatMessages}
                  areSuggestionsVisible={areSuggestionsVisible}
                  currentTranslation={currentTranslation}
                  isBotCurrentlyStreaming={isBotCurrentlyStreaming}
                  isBotTypingIndicatorVisible={isBotTypingIndicatorVisible}
                  onSendMessage={sendMessage}
                  messagesEndRef={messagesEndRef}
                  companyLogo={COMPANY_LOGO}
                />

                <ChatInput
                  inputMessage={inputMessage}
                  setInputMessage={setInputMessage}
                  onSendMessage={sendMessage}
                  isBotStreaming={isBotCurrentlyStreaming}
                  placeholders={currentTranslation.placeholders}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
