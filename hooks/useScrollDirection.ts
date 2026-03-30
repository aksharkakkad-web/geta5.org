'use client'
import { useEffect, useRef, useState } from 'react'

type ScrollDir = 'up' | 'down' | null

export function useScrollDirection(threshold = 50) {
  const [direction, setDirection] = useState<ScrollDir>(null)
  const [isAtTop, setIsAtTop] = useState(true)
  const lastY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setIsAtTop(y < 10)
      if (Math.abs(y - lastY.current) < threshold) return
      setDirection(y > lastY.current ? 'down' : 'up')
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return { direction, isAtTop }
}
