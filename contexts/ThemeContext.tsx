'use client'
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextValue {
  resolvedTheme: Theme
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  resolvedTheme: 'dark',
  setTheme: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

const LIGHT_VARS: Record<string, string> = {
  '--bg-primary': '#fafafa',
  '--bg-secondary': '#f2f2f8',
  '--bg-card': '#ffffff',
  '--bg-card-hover': '#ebebf5',
  '--bg-border': '#ddddf0',
  '--text-primary': '#111118',
  '--text-secondary': '#555566',
  '--text-muted': '#9494a8',
  '--mastery-empty': '#e2e2f0',
  '--bg-header-alpha': 'rgba(250,250,250,0.9)',
  '--bg-overlay': 'rgba(255,255,255,0.92)',
  '--bg-overlay-subtle': 'rgba(255,255,255,0.7)',
  '--border-subtle': 'rgba(0,0,0,0.05)',
  '--border-medium': 'rgba(0,0,0,0.07)',
  '--border-strong': 'rgba(0,0,0,0.09)',
  '--border-interactive': 'rgba(0,0,0,0.12)',
  '--border-interactive-hover': 'rgba(0,0,0,0.20)',
}

function applyTheme(t: Theme) {
  const el = document.documentElement
  el.setAttribute('data-theme', t)
  if (t === 'light') {
    Object.entries(LIGHT_VARS).forEach(([k, v]) => el.style.setProperty(k, v))
  } else {
    Object.keys(LIGHT_VARS).forEach(k => el.style.removeProperty(k))
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('ascendly-theme') as Theme | null
    const t = saved === 'light' ? 'light' : 'dark'
    setThemeState(t)
    applyTheme(t)
  }, [])

  const setTheme = (t: Theme) => {
    setThemeState(t)
    applyTheme(t)
    localStorage.setItem('ascendly-theme', t)
  }

  return (
    <ThemeContext.Provider value={{ resolvedTheme: theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
