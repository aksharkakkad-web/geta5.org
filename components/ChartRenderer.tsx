// components/ChartRenderer.tsx
'use client'
import { useEffect, useRef } from 'react'
import { Chart, ChartConfiguration, registerables } from 'chart.js'

Chart.register(...registerables)

interface Props {
  config: ChartConfiguration
  className?: string
}

export default function ChartRenderer({ config, className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    // Destroy existing chart before re-creating (avoids double-destroy on config change)
    if (chartRef.current) {
      chartRef.current.destroy()
      chartRef.current = null
    }
    chartRef.current = new Chart(canvasRef.current, {
      ...config,
      options: {
        ...config.options,
        responsive: true,
        plugins: {
          ...config.options?.plugins,
          legend: {
            labels: { color: '#a1a1a1' },
            ...config.options?.plugins?.legend,
          },
        },
        scales: config.options?.scales
          ? Object.fromEntries(
              Object.entries(config.options.scales).map(([k, v]) => [
                k,
                {
                  ...v,
                  ticks: { color: '#a1a1a1', ...((v as Record<string, unknown>).ticks as object | undefined) },
                  grid: { color: '#222222', ...((v as Record<string, unknown>).grid as object | undefined) },
                },
              ])
            )
          : undefined,
      },
    })
    return () => {
      chartRef.current?.destroy()
      chartRef.current = null // prevent double-destroy on config change
    }
  }, [config])

  return (
    <div className={className} style={{ position: 'relative', maxWidth: '100%' }}>
      <canvas ref={canvasRef} />
    </div>
  )
}
