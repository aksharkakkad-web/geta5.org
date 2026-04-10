'use client'

import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Line, Doughnut, Pie } from 'react-chartjs-2'
import KatexRenderer from '@/components/KatexRenderer'

// Register Chart.js components at module level (not inside component)
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
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

/**
 * Deep-merges dark theme colors into a Chart.js config.
 * Uses hex values since var() CSS custom properties don't work in JS Chart.js config.
 * CSS custom property equivalents:
 *   #a1a1a1 = --text-secondary
 *   #f5f5f5 = --text-primary
 *   #222222 = --bg-border
 */
function applyDarkTheme(config: Record<string, unknown>): Record<string, unknown> {
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
        color: '#a1a1a1',
      },
    },
  }

  if (titlePlugin && Object.keys(titlePlugin).length > 0) {
    themedPlugins.title = {
      ...titlePlugin,
      color: '#f5f5f5',
    }
  }

  // Apply dark theme to all scales
  const scales = (options.scales as Record<string, Record<string, unknown>>) ?? {}
  const themedScales: Record<string, Record<string, unknown>> = {}
  for (const [key, scale] of Object.entries(scales)) {
    const ticks = (scale.ticks as Record<string, unknown>) ?? {}
    const grid = (scale.grid as Record<string, unknown>) ?? {}
    themedScales[key] = {
      ...scale,
      ticks: { ...ticks, color: '#a1a1a1' },
      grid: { ...grid, color: '#222222' },
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
    const themedConfig = applyDarkTheme(rawConfig)
    const chartType = rawConfig.type as string
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
