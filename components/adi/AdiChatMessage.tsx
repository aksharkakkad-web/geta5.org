'use client'

import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import type { UIMessage } from '@ai-sdk/react'

interface AdiChatMessageProps {
  message: UIMessage
}

/** Extract text content from UIMessage parts array */
function getTextContent(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('')
}

export function AdiChatMessage({ message }: AdiChatMessageProps) {
  const text = getTextContent(message)

  if (message.role === 'user') {
    return (
      <div className="adi-msg adi-msg-user">
        {text}
      </div>
    )
  }

  return (
    <div className="adi-msg adi-msg-adi">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {text}
      </ReactMarkdown>
    </div>
  )
}
