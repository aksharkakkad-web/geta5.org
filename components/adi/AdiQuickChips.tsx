'use client'

import { useAdi } from './AdiProvider'

const CHIP_SETS: Record<string, string[]> = {
  mcq: ['🔄 Explain simpler', '📝 Similar question', '📚 Unit overview'],
  drill: ['🔄 Explain simpler', '📝 Give me a hint', '📚 Unit overview'],
  'study-guide': ['🧠 Quiz me on this', '📖 Explain this section', '💡 AP exam tips'],
  'practice-test': ['🔄 Explain simpler', '📝 Similar question', '📊 My weak areas'],
  home: ['💡 AP exam tips', '📚 Study recommendations'],
}

export function AdiQuickChips() {
  const { context, sendMessage, messages } = useAdi()

  const lastMsg = messages[messages.length - 1]
  if (messages.length > 0 && lastMsg?.role === 'user') return null

  const chips = CHIP_SETS[context.page] ?? CHIP_SETS.home

  return (
    <div className="adi-chips">
      {chips.map((chip) => (
        <button key={chip} className="adi-chip" onClick={() => sendMessage(chip)}>
          {chip}
        </button>
      ))}
    </div>
  )
}
