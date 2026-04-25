'use client'

import React from 'react'
import { useTheme } from 'next-themes'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  ScatterController,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Line, Doughnut, Pie, Scatter } from 'react-chartjs-2'
import KatexRenderer from '@/components/KatexRenderer'

// Register Chart.js components at module level (not inside component)
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  ScatterController,
  Title,
  Tooltip,
  Legend
)

// ─── Types ────────────────────────────────────────────────────────────────────

interface StimulusRendererProps {
  stimulus: {
    type: 'text' | 'table' | 'chart' | 'code' | 'none'
    content?: string | { headers: string[]; rows: string[][] } | Record<string, unknown> | null
  }
}

/** Shape of a single dataset in a polar stimulus JSON block. */
interface PolarDataset {
  label?: string
  rValues: number[]
  thetaValues: number[]
  borderColor?: string
  backgroundColor?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Splits text on $...$ inline math tokens.
 * Plain text segments → <span>, math segments → <KatexRenderer />.
 */
function parseInlineMath(text: string): React.ReactNode[] {
  const regex = /\$([^$]+)\$/g
  const nodes: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex, match.index)}</span>)
    }
    nodes.push(<KatexRenderer key={`math-${match.index}`} formula={match[1]} displayMode={false} />)
    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    nodes.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex)}</span>)
  }

  return nodes
}

interface ChartColors { secondary: string; primary: string; grid: string }

function getChartColors(): ChartColors {
  if (typeof window === 'undefined') return { secondary: '#a1a1a1', primary: '#f5f5f5', grid: '#1a1a2e' }
  const s = getComputedStyle(document.documentElement)
  return {
    secondary: s.getPropertyValue('--text-secondary').trim() || '#a1a1a1',
    primary: s.getPropertyValue('--text-primary').trim() || '#f5f5f5',
    grid: s.getPropertyValue('--bg-border').trim() || '#1a1a2e',
  }
}

function applyChartTheme(config: Record<string, unknown>, colors: ChartColors): Record<string, unknown> {
  const options = (config.options as Record<string, unknown>) ?? {}
  const plugins = (options.plugins as Record<string, unknown>) ?? {}
  const legend = (plugins.legend as Record<string, unknown>) ?? {}
  const legendLabels = (legend.labels as Record<string, unknown>) ?? {}
  const titlePlugin = (plugins.title as Record<string, unknown>) ?? {}

  const themedPlugins: Record<string, unknown> = {
    ...plugins,
    legend: {
      ...legend,
      labels: {
        ...legendLabels,
        color: colors.secondary,
      },
    },
  }

  if (titlePlugin && Object.keys(titlePlugin).length > 0) {
    themedPlugins.title = {
      ...titlePlugin,
      color: colors.primary,
    }
  }

  const scales = (options.scales as Record<string, Record<string, unknown>>) ?? {}
  const themedScales: Record<string, Record<string, unknown>> = {}
  for (const [key, scale] of Object.entries(scales)) {
    const ticks = (scale.ticks as Record<string, unknown>) ?? {}
    const grid = (scale.grid as Record<string, unknown>) ?? {}
    themedScales[key] = {
      ...scale,
      ticks: { ...ticks, color: colors.secondary },
      grid: { ...grid, color: colors.grid },
    }
  }

  return {
    ...config,
    options: {
      ...options,
      plugins: themedPlugins,
      ...(Object.keys(themedScales).length > 0 ? { scales: themedScales } : {}),
    },
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StimulusRenderer({ stimulus }: StimulusRendererProps) {
  useTheme() // subscribe to theme changes so chart colors re-resolve on toggle
  const chartColors = getChartColors()

  if (stimulus.type === 'none' || stimulus.content == null) {
    return null
  }

  if (stimulus.type === 'text') {
    const content = stimulus.content as string
    return (
      <>
        <blockquote
          className="stimulus-text"
          style={{
            background: 'var(--bg-card)',
            borderLeft: '3px solid var(--accent)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            overflowY: 'auto',
            fontSize: '0.9375rem',
            lineHeight: 1.7,
            color: 'var(--text-secondary)',
            margin: 0,
          }}
        >
          {parseInlineMath(content)}
        </blockquote>
        <style>{`
          .stimulus-text { max-height: 240px; }
          @media (min-width: 640px) { .stimulus-text { max-height: 320px; } }
        `}</style>
      </>
    )
  }

  if (stimulus.type === 'table') {
    const content = stimulus.content as { headers: string[]; rows: string[][] }
    return (
      <div
        style={{
          overflowX: 'auto',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--bg-border)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead style={{ background: 'var(--bg-secondary)' }}>
            <tr>
              {content.headers.map((header, i) => (
                <th
                  key={i}
                  style={{
                    padding: '10px 14px',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    borderBottom: '2px solid var(--bg-border)',
                  }}
                >
                  {parseInlineMath(header)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {content.rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    style={{
                      padding: '10px 14px',
                      color: 'var(--text-secondary)',
                      borderBottom: '1px solid var(--bg-border)',
                    }}
                  >
                    {parseInlineMath(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (stimulus.type === 'chart') {
    const rawConfig = stimulus.content as Record<string, unknown>
    const themedConfig = applyChartTheme(rawConfig, chartColors)
    const chartType = rawConfig.type as string

    // For line charts, use Fritsch-Carlson monotone cubic interpolation.
    // This produces smooth curves through all data points without overshoot —
    // correct for parabolas, cubics, sine waves, and other AP math functions.
    // `tension` is intentionally omitted: it is ignored whenever cubicInterpolationMode
    // is 'monotone' (they are mutually exclusive algorithms in Chart.js).
    // Spread order: defaults first, dataset props second — so explicit per-dataset
    // overrides in content JSON still win.
    if (chartType === 'line') {
      const chartData = themedConfig.data as { datasets?: Record<string, unknown>[] }
      if (chartData?.datasets) {
        chartData.datasets = chartData.datasets.map((ds) => ({
          cubicInterpolationMode: 'monotone',
          ...ds,
        }))
      }
    }

    // ── Polar coordinate branch ────────────────────────────────────────────────
    // Converts (r, θ) pairs → Cartesian (x, y) and renders as a Scatter chart.
    // Equal axis range keeps circles circular rather than elliptical.
    if (chartType === 'polar') {
      const polarData = rawConfig.data as { datasets: PolarDataset[] }
      const titleText = (rawConfig.options as Record<string, unknown> | undefined)
        ?.title as string | undefined

      // Convert each polar dataset to Cartesian {x, y} points and find maxR.
      let maxR = 0
      const cartesianDatasets = (polarData?.datasets ?? []).map((ds) => {
        const points = (ds.rValues ?? []).map((r, i) => {
          const theta = ds.thetaValues?.[i] ?? 0
          if (r > maxR) maxR = r
          return { x: r * Math.cos(theta), y: r * Math.sin(theta) }
        })
        return {
          label: ds.label ?? '',
          data: points,
          showLine: true,
          borderColor: ds.borderColor ?? '#6366f1',
          backgroundColor: ds.backgroundColor ?? 'transparent',
          pointRadius: 0,
          borderWidth: 2,
          tension: 0,
        }
      })

      // Crosshair lines — two invisible-label datasets through the origin.
      const axisRange = maxR * 1.1
      const crosshairColor = 'rgba(100,100,100,0.3)'
      const horizontalLine = {
        label: '',
        data: [{ x: -axisRange, y: 0 }, { x: axisRange, y: 0 }],
        showLine: true,
        borderColor: crosshairColor,
        backgroundColor: 'transparent',
        pointRadius: 0,
        borderWidth: 1,
        tension: 0,
      }
      const verticalLine = {
        label: '',
        data: [{ x: 0, y: -axisRange }, { x: 0, y: axisRange }],
        showLine: true,
        borderColor: crosshairColor,
        backgroundColor: 'transparent',
        pointRadius: 0,
        borderWidth: 1,
        tension: 0,
      }

      const polarScatterData = {
        datasets: [...cartesianDatasets, horizontalLine, verticalLine],
      }

      const polarOptions = {
        responsive: true,
        maintainAspectRatio: true,
        animation: false as const,
        plugins: {
          legend: {
            // Only show the actual curve labels — hide crosshair pseudo-datasets.
            labels: {
              color: chartColors.secondary,
              filter: (item: { text: string }) => item.text !== '',
            },
          },
          tooltip: { enabled: false },
          ...(titleText
            ? {
                title: {
                  display: true,
                  text: titleText,
                  color: chartColors.primary,
                  font: { size: 13 },
                },
              }
            : {}),
        },
        scales: {
          x: {
            type: 'linear' as const,
            min: -axisRange,
            max: axisRange,
            grid: { color: chartColors.grid },
            ticks: {
              // Hide numeric axis labels — only the curve shape matters for polar plots.
              display: false,
            },
          },
          y: {
            type: 'linear' as const,
            min: -axisRange,
            max: axisRange,
            grid: { color: chartColors.grid },
            ticks: { display: false },
          },
        },
      }

      return (
        <div style={{ maxWidth: 400, margin: '0 auto', padding: '16px 0' }}>
          <Scatter data={polarScatterData} options={polarOptions} />
        </div>
      )
    }
    // ── End polar branch ───────────────────────────────────────────────────────

    const data = themedConfig.data as Parameters<typeof Bar>[0]['data']
    const options = themedConfig.options as Parameters<typeof Bar>[0]['options']

    let ChartComponent: React.ComponentType<{ data: typeof data; options?: typeof options }>
    switch (chartType) {
      case 'line':
        ChartComponent = Line as unknown as typeof ChartComponent
        break
      case 'doughnut':
        ChartComponent = Doughnut as unknown as typeof ChartComponent
        break
      case 'pie':
        ChartComponent = Pie as unknown as typeof ChartComponent
        break
      default:
        ChartComponent = Bar as unknown as typeof ChartComponent
    }

    return (
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '16px 0' }}>
        <ChartComponent data={data} options={options} />
      </div>
    )
  }

  if (stimulus.type === 'code') {
    const content = stimulus.content as string
    return (
      <pre
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--bg-border)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          overflowX: 'auto',
          fontSize: '0.875rem',
          lineHeight: 1.6,
          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
          color: 'var(--text-primary)',
          whiteSpace: 'pre-wrap',
        }}
      >
        <code>{content}</code>
      </pre>
    )
  }

  return null
}
