import { handleApiError } from '@/lib/errorHandler';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const CHAT_API_URL = process.env.NEXT_PUBLIC_CHAT_API_URL;
const DEFAULT_CACHE_TIME = 3600;
const CHAT_SESSION_KEY = 'teldat-chat-session';

const API_RESPONSE_TYPES = {
  CHUNK: 'chunk',
  SESSION_ID: 'session_id',
  DONE: 'done',
  ERROR: 'error',
};

const handleError = async (response) => {
  if (!response.ok) {
    const errorData = await response.json();

    const error = {
      message: errorData.message,
      status: response.status,
      context: response.statusText,
    };

    throw handleApiError(error);
  }
  return response;
};

const endpoints = {
  chat: {
    stream: async (
      { message, session_id = '', locale = 'en' },
      onChunk,
      onDone,
      onError
    ) => {
      try {
        const response = await fetch(`${CHAT_API_URL}/api/chat/stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            session_id,
            locale,
          }),
        });

        await handleError(response);

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullResponse = '';
        let currentSessionId = session_id;

        const processChunk = async () => {
          const { value, done } = await reader.read();

          if (done) {
            onDone?.(fullResponse, currentSessionId);
            return;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          lines.forEach((line) => {
            const dataMatch = line.match(/^data:\s*(.+)$/);
            if (!dataMatch?.[1]?.trim()) return;

            try {
              const data = JSON.parse(dataMatch[1]);

              switch (data.type) {
                case 'session_id':
                  if (data.data && !currentSessionId) {
                    currentSessionId = data.data;
                    typeof window !== 'undefined' &&
                      window.localStorage.setItem(
                        CHAT_SESSION_KEY,
                        currentSessionId
                      );
                  }
                  break;

                case 'chunk':
                  if (typeof data.data === 'string') {
                    fullResponse += data.data;
                    onChunk?.(data.data, currentSessionId);
                  }
                  break;

                case 'done':
                  onDone?.(fullResponse, currentSessionId);
                  return;

                case 'error':
                  throw new Error(data.message || 'Stream error');
              }
            } catch (parseError) {
              console.warn('Failed to parse stream data:', parseError);
            }
          });

          return processChunk();
        };

        await processChunk();
      } catch (error) {
        console.error('Chat stream failed:', error);
        onError?.(error);
      }
    },

    history: async (sessionId) => {
      const response = await fetch(
        `${CHAT_API_URL}/api/chat/history/${sessionId}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      await handleError(response);
      return response.json();
    },

    getCurrentSessionId: () => {
      return typeof window !== 'undefined'
        ? window.localStorage.getItem(CHAT_SESSION_KEY)
        : null;
    },

    clearSession: () => {
      typeof window !== 'undefined' &&
        window.localStorage.removeItem(CHAT_SESSION_KEY);
    },
  },
};

export default endpoints;
export { API_RESPONSE_TYPES, CHAT_SESSION_KEY };
