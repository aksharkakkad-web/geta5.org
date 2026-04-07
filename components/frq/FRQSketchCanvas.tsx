'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

interface FRQSketchCanvasProps {
  prompt: string
  referenceImage: string | null
  stimulusImage?: string | null
}

export default function FRQSketchCanvas({ prompt, referenceImage, stimulusImage }: FRQSketchCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size to match display size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Draw grid
    drawGrid(ctx, rect.width, rect.height)
  }, [])

  const drawGrid = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.08)'
    ctx.lineWidth = 0.5
    const step = 20
    for (let x = 0; x <= w; x += step) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, h)
      ctx.stroke()
    }
    for (let y = 0; y <= h; y += step) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
      ctx.stroke()
    }
    // Axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(w / 2, 0)
    ctx.lineTo(w / 2, h)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, h / 2)
    ctx.lineTo(w, h / 2)
    ctx.stroke()
  }

  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    if ('touches' in e) {
      const touch = e.touches[0]
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top }
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }, [])

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    setIsDrawing(true)
    setHasDrawn(true)
    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    ctx.strokeStyle = 'var(--accent-hover, #818cf8)'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [getPos])

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    e.preventDefault()
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return

    const pos = getPos(e)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
  }, [isDrawing, getPos])

  const endDraw = useCallback(() => {
    setIsDrawing(false)
  }, [])

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0)
    drawGrid(ctx, rect.width, rect.height)
    setHasDrawn(false)
    setShowAnswer(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Prompt */}
      <div style={{
        fontSize: 13,
        color: 'var(--text-secondary)',
        lineHeight: 1.6,
        padding: '10px 14px',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        borderLeft: '3px solid var(--accent)',
      }}>
        {prompt}
      </div>

      {/* Stimulus image if provided (e.g., a graph to draw on) */}
      {stimulusImage && (
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: 'var(--radius-md)',
          padding: 12,
          border: '1px solid var(--bg-border)',
        }}>
          <img
            src={stimulusImage}
            alt="Reference figure"
            style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto' }}
          />
        </div>
      )}

      {/* Canvas */}
      <div style={{
        position: 'relative',
        background: 'var(--bg-primary)',
        border: '1px solid var(--bg-border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}>
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: 280,
            cursor: 'crosshair',
            touchAction: 'none',
            display: 'block',
          }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />

        {/* Hint overlay when empty */}
        {!hasDrawn && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'var(--text-muted)',
            fontSize: 13,
            pointerEvents: 'none',
            textAlign: 'center',
          }}>
            Draw your answer here
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={clearCanvas}
          style={{
            background: 'transparent',
            color: 'var(--text-muted)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: 12,
            border: '1px solid var(--bg-border)',
            cursor: 'pointer',
            transition: 'border-color 150ms ease, color 150ms ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--text-primary)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--bg-border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          Clear
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Self-assessed — not graded by Adi
          </span>
          {referenceImage && (
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              style={{
                background: showAnswer ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                color: showAnswer ? 'var(--accent-hover)' : 'var(--text-secondary)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 12,
                fontWeight: 500,
                border: `1px solid ${showAnswer ? 'rgba(99, 102, 241, 0.3)' : 'var(--bg-border)'}`,
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
            >
              {showAnswer ? 'Hide Answer' : 'Show Answer'}
            </button>
          )}
        </div>
      </div>

      {/* Reference answer */}
      {showAnswer && referenceImage && (
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: 'var(--radius-md)',
          padding: 16,
          border: '1px solid rgba(34, 197, 94, 0.3)',
          boxShadow: '0 0 16px rgba(34, 197, 94, 0.08)',
        }}>
          <div style={{
            fontSize: 11,
            textTransform: 'uppercase' as const,
            letterSpacing: 1.5,
            color: 'var(--accent-success)',
            fontWeight: 500,
            marginBottom: 8,
          }}>
            Correct Answer
          </div>
          <img
            src={referenceImage}
            alt="Correct answer"
            style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto' }}
          />
        </div>
      )}

      {/* Fallback if no reference image */}
      {showAnswer && !referenceImage && (
        <div style={{
          padding: '12px 16px',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-muted)',
          fontSize: 13,
          fontStyle: 'italic',
        }}>
          Reference answer image not available. Check the scoring guidelines for this question.
        </div>
      )}
    </div>
  )
}
