import React from 'react'

jest.mock('@/components/KatexRenderer', () => ({
  __esModule: true,
  default: function KatexRenderer({ formula, displayMode }: { formula: string; displayMode: boolean }) {
    return null
  },
}))

import { parseInlineMath } from '@/utils/parseInlineMath'

describe('parseInlineMath', () => {
  it('returns empty array for empty string', () => {
    expect(parseInlineMath('')).toEqual([])
  })

  it('wraps plain text in a span with the text as children', () => {
    const nodes = parseInlineMath('hello world')
    expect(nodes).toHaveLength(1)
    const el = nodes[0] as React.ReactElement
    expect(el.type).toBe('span')
    expect(el.props.children).toBe('hello world')
  })

  it('creates a KatexRenderer node for an isolated $formula$ token', () => {
    const nodes = parseInlineMath('$x^2$')
    expect(nodes).toHaveLength(1)
    const el = nodes[0] as React.ReactElement
    expect(el.props.formula).toBe('x^2')
    expect(el.props.displayMode).toBe(false)
  })

  it('splits mixed text and math into three ordered nodes', () => {
    const nodes = parseInlineMath('Area is $\\pi r^2$ always')
    expect(nodes).toHaveLength(3)
    expect((nodes[0] as React.ReactElement).props.children).toBe('Area is ')
    expect((nodes[1] as React.ReactElement).props.formula).toBe('\\pi r^2')
    expect((nodes[2] as React.ReactElement).props.children).toBe(' always')
  })

  it('handles multiple math tokens in one string', () => {
    const nodes = parseInlineMath('$a$ and $b$')
    expect(nodes).toHaveLength(3) // KatexRenderer, span(' and '), KatexRenderer
    expect((nodes[0] as React.ReactElement).props.formula).toBe('a')
    expect((nodes[2] as React.ReactElement).props.formula).toBe('b')
  })
})
