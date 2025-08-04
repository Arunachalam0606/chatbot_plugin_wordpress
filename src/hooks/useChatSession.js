import { useState, useEffect } from 'react'
import endpoints from '@/api/api'

const useChatSession = sessionKey => {
  const [sessionId, setSessionId] = useState('')

  useEffect(() => {
    const existingSession = endpoints.chat.getCurrentSessionId()
    if (existingSession) {
      setSessionId(existingSession)
    }
  }, [])

  useEffect(() => {
    if (sessionId && typeof window !== 'undefined') {
      window.localStorage.setItem(sessionKey, sessionId)
    }
  }, [sessionId, sessionKey])

  const clearSession = () => {
    endpoints.chat.clearSession()
    setSessionId('')
  }

  const updateSession = newSessionId => {
    setSessionId(newSessionId)
  }

  return {
    sessionId,
    clearSession,
    updateSession
  }
}

export { useChatSession }
