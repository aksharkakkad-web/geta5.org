'use client'

import { useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { useAdi } from './AdiProvider'
import { AdiIcon } from './AdiMascot'
import { AdiChatMessage } from './AdiChatMessage'
import { AdiQuickChips } from './AdiQuickChips'

export function AdiChatPanel() {
  const {
    isOpen, close,
    messages, input, handleInputChange, handleSubmit, isLoading,
    context,
  } = useAdi()

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!isOpen) return null

  const ctxLabel = context.questionId
    ? `📍 Viewing ${context.questionId} · ${context.unit}`
    : context.unit
      ? `📍 ${context.subject} · ${context.unit}`
      : context.subject
        ? `📍 ${context.subject}`
        : null

  return (
    <>
      <div className="adi-backdrop" onClick={close} />
      <div className="adi-panel">
        <div className="adi-panel-header">
          <AdiIcon size={40} />
          <div>
            <h3>Adi</h3>
            <span className="adi-panel-status">Online</span>
          </div>
          <button className="adi-panel-close" onClick={close} aria-label="Close Adi">
            ✕
          </button>
        </div>

        <div className="adi-messages">
          {ctxLabel && <div className="adi-ctx-pill">{ctxLabel}</div>}

          {messages.length === 0 && (
            <div className="adi-msg adi-msg-adi">
              Hey! I&apos;m Adi, your AP study buddy. Ask me anything about the material you&apos;re studying — I can explain concepts, break down tricky questions, or give you exam tips.
            </div>
          )}

          {messages.map((msg) => (
            <AdiChatMessage key={msg.id} message={msg} />
          ))}

          {isLoading && (
            <div className="adi-msg adi-msg-adi" style={{ opacity: 0.6 }}>
              <span style={{ display: 'inline-flex', gap: 4 }}>
                <span style={{ animation: 'adiBob 1s ease-in-out infinite' }}>·</span>
                <span style={{ animation: 'adiBob 1s ease-in-out 0.2s infinite' }}>·</span>
                <span style={{ animation: 'adiBob 1s ease-in-out 0.4s infinite' }}>·</span>
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <AdiQuickChips />

        <form className="adi-input-bar" onSubmit={handleSubmit}>
          <input
            className="adi-input"
            value={input}
            onChange={handleInputChange}
            placeholder="Ask Adi anything..."
            disabled={isLoading}
          />
          <button className="adi-send" type="submit" disabled={isLoading || !input.trim()} aria-label="Send message">
            <Send size={16} />
          </button>
        </form>
      </div>
    </>
  )
}
