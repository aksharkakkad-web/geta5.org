'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { X, ChevronDown, ChevronUp, Calculator } from 'lucide-react'

interface DesmosPanelProps {
  onClose: () => void
}

const DEFAULT_WIDTH = 400
const DEFAULT_HEIGHT = 360
const MIN_WIDTH = 260
const MAX_WIDTH = 900
const MIN_HEIGHT = 200
const MAX_HEIGHT = 800
const HEADER_HEIGHT = 48

type ResizeEdge = 'e' | 's' | 'w' | 'se' | 'sw'

interface ResizeSnapshot {
  edge: ResizeEdge
  startX: number
  startY: number
  startWidth: number
  startHeight: number
  startPosX: number
  startPosY: number
}

export default function DesmosPanel({ onClose }: DesmosPanelProps) {
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: -1, y: -1 })
  const [size, setSize] = useState({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT })
  const [minimized, setMinimized] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [resizing, setResizing] = useState(false)
  const dragOffset = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 })
  const resizeSnap = useRef<ResizeSnapshot | null>(null)

  useEffect(() => {
    setPosition({
      x: window.innerWidth - DEFAULT_WIDTH - 20,
      y: window.innerHeight - DEFAULT_HEIGHT - 20,
    })
  }, [])

  // ── Drag ─────────────────────────────────────────────────────────────────
  const handleHeaderPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragOffset.current = { dx: e.clientX - position.x, dy: e.clientY - position.y }
    setDragging(true)
  }, [position])

  useEffect(() => {
    if (!dragging) return
    const onMove = (e: PointerEvent) => {
      const panelH = minimized ? HEADER_HEIGHT : size.height
      setPosition({
        x: Math.max(0, Math.min(e.clientX - dragOffset.current.dx, window.innerWidth - size.width)),
        y: Math.max(0, Math.min(e.clientY - dragOffset.current.dy, window.innerHeight - panelH)),
      })
    }
    const onUp = () => setDragging(false)
    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
    return () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
    }
  }, [dragging, minimized, size])

  // ── Resize ────────────────────────────────────────────────────────────────
  const handleResizePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>, edge: ResizeEdge) => {
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    resizeSnap.current = {
      edge,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: size.width,
      startHeight: size.height,
      startPosX: position.x,
      startPosY: position.y,
    }
    setResizing(true)
  }, [size, position])

  useEffect(() => {
    if (!resizing) return
    const onMove = (e: PointerEvent) => {
      const s = resizeSnap.current!
      const dx = e.clientX - s.startX
      const dy = e.clientY - s.startY
      let w = s.startWidth, h = s.startHeight, x = s.startPosX

      if (s.edge === 'e' || s.edge === 'se') {
        w = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, s.startWidth + dx))
      }
      if (s.edge === 'w' || s.edge === 'sw') {
        w = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, s.startWidth - dx))
        x = s.startPosX + (s.startWidth - w)
      }
      if (s.edge === 's' || s.edge === 'se' || s.edge === 'sw') {
        h = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, s.startHeight + dy))
      }
      setSize({ width: w, height: h })
      setPosition(prev => ({ ...prev, x }))
    }
    const onUp = () => setResizing(false)
    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
    return () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
    }
  }, [resizing])

  if (position.x === -1) return null

  const panelHeight = minimized ? HEADER_HEIGHT : size.height
  const active = dragging || resizing

  return (
    // Outer shell — positioning only, no overflow clip so resize handles aren't clipped
    <div
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: size.width,
        height: panelHeight,
        zIndex: 1000,
        transition: active ? 'none' : 'height 200ms ease',
      }}
    >
      {/* Visual container — carries border/shadow/overflow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--bg-border)',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Header / drag handle */}
        <div
          onPointerDown={handleHeaderPointerDown}
          style={{
            height: HEADER_HEIGHT,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            gap: '8px',
            background: 'var(--bg-card)',
            borderBottom: minimized ? 'none' : '1px solid var(--bg-border)',
            cursor: dragging ? 'grabbing' : 'grab',
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
        >
          <Calculator size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          <span style={{
            flex: 1,
            fontSize: '13px',
            fontWeight: 600,
            fontFamily: 'var(--font-outfit)',
            color: 'var(--text-secondary)',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}>
            Graphing Calculator
          </span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setMinimized(m => !m) }}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label={minimized ? 'Expand calculator' : 'Collapse calculator'}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 26, height: 26, background: 'transparent', border: 'none',
              borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0,
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)' }}
          >
            {minimized ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClose() }}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Close calculator"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 26, height: 26, background: 'transparent', border: 'none',
              borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0,
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)' }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Iframe body */}
        {!minimized && (
          <div style={{ flex: 1, position: 'relative', background: '#fff' }}>
            <iframe
              src="https://www.desmos.com/calculator"
              title="Desmos Graphing Calculator"
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              allow="fullscreen"
            />
          </div>
        )}
      </div>

      {/* Resize handles — rendered outside visual container so they aren't overflow-clipped */}
      {!minimized && (
        <>
          {/* East */}
          <div onPointerDown={(e) => handleResizePointerDown(e, 'e')}
            style={{ position: 'absolute', right: -4, top: 10, bottom: 10, width: 8, cursor: 'ew-resize', zIndex: 1 }} />
          {/* West */}
          <div onPointerDown={(e) => handleResizePointerDown(e, 'w')}
            style={{ position: 'absolute', left: -4, top: 10, bottom: 10, width: 8, cursor: 'ew-resize', zIndex: 1 }} />
          {/* South */}
          <div onPointerDown={(e) => handleResizePointerDown(e, 's')}
            style={{ position: 'absolute', bottom: -4, left: 10, right: 10, height: 8, cursor: 'ns-resize', zIndex: 1 }} />
          {/* Southeast */}
          <div onPointerDown={(e) => handleResizePointerDown(e, 'se')}
            style={{ position: 'absolute', right: -4, bottom: -4, width: 14, height: 14, cursor: 'se-resize', zIndex: 2 }} />
          {/* Southwest */}
          <div onPointerDown={(e) => handleResizePointerDown(e, 'sw')}
            style={{ position: 'absolute', left: -4, bottom: -4, width: 14, height: 14, cursor: 'sw-resize', zIndex: 2 }} />
        </>
      )}
    </div>
  )
}
