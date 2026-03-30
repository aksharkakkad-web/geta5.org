'use client'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useRef, type ReactNode } from 'react'

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [displayChildren, setDisplayChildren] = useState(children)
  const [stage, setStage] = useState<'enter' | 'exit'>('enter')
  const prevPathname = useRef(pathname)

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      setStage('exit')
      const timeout = setTimeout(() => {
        setDisplayChildren(children)
        setStage('enter')
        prevPathname.current = pathname
      }, 300)
      return () => clearTimeout(timeout)
    } else {
      setDisplayChildren(children)
    }
  }, [pathname, children])

  return (
    <div style={{
      opacity: stage === 'enter' ? 1 : 0,
      transform: stage === 'enter' ? 'translateY(0)' : 'translateY(-15px)',
      transition: 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.16,1,0.3,1)',
    }}>
      {displayChildren}
    </div>
  )
}
