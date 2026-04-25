// components/ChartRenderer.tsx
'use client'
import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import { Chart, ChartConfiguration, registerables } from 'chart.js'

Chart.register(...registerables)

interface Props {
  config: ChartConfiguration
  className?: string
}

function getChartColors() {
  if (typeof window === 'undefined') return { secondary: '#a1a1a1', grid: '#1a1a2e' }
  const s = getComputedStyle(document.documentElement)
  return {
    secondary: s.getPropertyValue('--text-secondary').trim() || '#a1a1a1',
    grid: s.getPropertyValue('--bg-border').trim() || '#1a1a2e',
  }
}

export default function ChartRenderer({ config, className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (!canvasRef.current) return
    if (chartRef.current) {
      chartRef.current.destroy()
      chartRef.current = null
    }
    const colors = getChartColors()
    chartRef.current = new Chart(canvasRef.current, {
      ...config,
      options: {
        ...config.options,
        responsive: true,
        plugins: {
          ...config.options?.plugins,
          legend: {
            labels: { color: colors.secondary },
            ...config.options?.plugins?.legend,
          },
        },
        scales: config.options?.scales
          ? Object.fromEntries(
              Object.entries(config.options.scales).map(([k, v]) => [
                k,
                {
                  ...v,
                  ticks: { color: colors.secondary, ...((v as Record<string, unknown>).ticks as object | undefined) },
                  grid: { color: colors.grid, ...((v as Record<string, unknown>).grid as object | undefined) },
                },
              ])
            )
          : undefined,
      },
    })
    return () => {
      chartRef.current?.destroy()
      chartRef.current = null
    }
  }, [config, resolvedTheme])

  return (
    <div className={className} style={{ position: 'relative', maxWidth: '100%' }}>
      <canvas ref={canvasRef} />
    </div>
  )
}
