'use client'

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ReferenceSheetSidebarProps {
  children: React.ReactNode
  title: string
}

const SIDEBAR_WIDTH = 320
const TAB_WIDTH = 32
const TAB_HEIGHT = 120

export default function ReferenceSheetSidebar({ children, title }: ReferenceSheetSidebarProps) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div
      style={{
        position: 'fixed',
        right: 0,
        top: 64,
        bottom: 0,
        width: isOpen ? SIDEBAR_WIDTH + TAB_WIDTH : TAB_WIDTH,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        transition: 'width 250ms ease',
        pointerEvents: 'none',
      }}
    >
      {/* Toggle tab */}
      <div
        style={{
          pointerEvents: 'auto',
          position: 'relative',
          width: TAB_WIDTH,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <button
          type="button"
          onClick={() => setIsOpen(o => !o)}
          aria-label={isOpen ? 'Collapse reference sheet' : 'Expand reference sheet'}
          style={{
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            width: TAB_WIDTH,
            height: TAB_HEIGHT,
            background: 'var(--bg-card)',
            border: '1px solid var(--bg-border)',
            borderRight: 'none',
            borderRadius: '8px 0 0 8px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '8px 0',
            color: 'var(--text-muted)',
            transition: 'color 150ms ease',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)' }}
        >
          {isOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              fontFamily: 'var(--font-outfit)',
              color: 'inherit',
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              transform: 'rotate(180deg)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              maxHeight: 80,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </span>
        </button>
      </div>

      {/* Sidebar panel */}
      <div
        style={{
          pointerEvents: isOpen ? 'auto' : 'none',
          flex: 1,
          background: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--bg-border)',
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: isOpen ? '16px' : '0',
          opacity: isOpen ? 1 : 0,
          transition: 'opacity 200ms ease, padding 250ms ease',
        }}
      >
        {children}
      </div>
    </div>
  )
}
