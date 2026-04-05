'use client'

import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import type { Message } from 'ai'

interface AdiChatMessageProps {
  message: Message
}

export function AdiChatMessage({ message }: AdiChatMessageProps) {
  if (message.role === 'user') {
    return (
      <div className="adi-msg adi-msg-user">
        {message.content}
      </div>
    )
  }

  return (
    <div className="adi-msg adi-msg-adi">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {message.content}
      </ReactMarkdown>
    </div>
  )
}
