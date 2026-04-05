'use client'

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react'
import { useChat, type UIMessage } from '@ai-sdk/react'
import { TextStreamChatTransport } from 'ai'
import { useAdiContext } from '@/hooks/useAdiContext'
import { lsGet, lsSet, LS_KEYS } from '@/utils/localStorage'
import type { AdiContext } from '@/utils/adiPrompt'

interface QuestionInfo {
  questionId: string
  unit: string
  userAnswer?: string
  isCorrect?: boolean
}

interface AdiState {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
  messages: UIMessage[]
  input: string
  setInput: (value: string) => void
  handleSubmit: () => void
  isLoading: boolean
  sendMessage: (text: string) => void
  context: AdiContext
  setQuestion: (info: QuestionInfo | null) => void
  nudgeText: string | null
  showNudge: (text: string) => void
  dismissNudge: () => void
  nudgeDismissCount: number
}

const AdiContext_ = createContext<AdiState | null>(null)

export function useAdi(): AdiState {
  const ctx = useContext(AdiContext_)
  if (!ctx) throw new Error('useAdi must be used within AdiProvider')
  return ctx
}

export function AdiProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [nudgeText, setNudgeText] = useState<string | null>(null)
  const [questionInfo, setQuestionInfo] = useState<QuestionInfo | null>(null)
  const [input, setInput] = useState('')
  const nudgeDismissCountRef = useRef(lsGet(LS_KEYS.adiDismissCount, 0))

  const baseContext = useAdiContext()

  const context: AdiContext = {
    ...baseContext,
    ...(questionInfo && {
      unit: questionInfo.unit,
      questionId: questionInfo.questionId,
      userAnswer: questionInfo.userAnswer,
      isCorrect: questionInfo.isCorrect,
    }),
  }

  const { messages, sendMessage: chatSendMessage, status, setMessages } = useChat({
    transport: new TextStreamChatTransport({
      api: '/api/chat',
      body: { context },
    }),
    onFinish: () => {
      const count = lsGet(LS_KEYS.adiMessages, 0)
      lsSet(LS_KEYS.adiMessages, count + 1)
    },
  })

  const isLoading = status === 'submitted' || status === 'streaming'

  const open = useCallback(() => {
    setIsOpen(true)
    setNudgeText(null)
  }, [])

  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) setNudgeText(null)
      return !prev
    })
  }, [])

  const sendMessage = useCallback((text: string) => {
    chatSendMessage({ parts: [{ type: 'text' as const, text }] })
    setInput('')
  }, [chatSendMessage])

  const handleSubmit = useCallback(() => {
    if (!input.trim()) return
    sendMessage(input.trim())
  }, [input, sendMessage])

  const setQuestion = useCallback((info: QuestionInfo | null) => {
    setQuestionInfo(info)
    setMessages([])
  }, [setMessages])

  const showNudge = useCallback((text: string) => {
    if (nudgeDismissCountRef.current >= 3) return
    setNudgeText(text)
  }, [])

  const dismissNudge = useCallback(() => {
    setNudgeText(null)
    nudgeDismissCountRef.current++
    lsSet(LS_KEYS.adiDismissCount, nudgeDismissCountRef.current)
  }, [])

  return (
    <AdiContext_.Provider
      value={{
        isOpen, open, close, toggle,
        messages, input, setInput, handleSubmit, isLoading, sendMessage,
        context, setQuestion,
        nudgeText, showNudge, dismissNudge, nudgeDismissCount: nudgeDismissCountRef.current,
      }}
    >
      {children}
    </AdiContext_.Provider>
  )
}
