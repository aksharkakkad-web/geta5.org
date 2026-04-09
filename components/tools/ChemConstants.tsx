'use client'

import InlineMath from '@/components/InlineMath'

const CONSTANTS = [
  { symbol: '$R$', value: '$8.314\\ \\text{J mol}^{-1}\\text{ K}^{-1}$' },
  { symbol: '$R$', value: '$0.08206\\ \\text{L atm mol}^{-1}\\text{ K}^{-1}$' },
  { symbol: '$F$', value: '$96{,}485\\ \\text{C mol}^{-1}$' },
  { symbol: '$N_A$', value: '$6.022 \\times 10^{23}\\ \\text{mol}^{-1}$' },
  { symbol: '$k_B$', value: '$1.381 \\times 10^{-23}\\ \\text{J K}^{-1}$' },
  { symbol: '$h$', value: '$6.626 \\times 10^{-34}\\ \\text{J}\\cdot\\text{s}$' },
  { symbol: '$c$', value: '$2.998 \\times 10^{8}\\ \\text{m s}^{-1}$' },
  { symbol: '$K_w$', value: '$1.0 \\times 10^{-14}$ at 25°C' },
  { symbol: '$e$', value: '$1.602 \\times 10^{-19}\\ \\text{C}$' },
  { symbol: '$0\\text{°C}$', value: '$273.15\\ \\text{K}$' },
  { symbol: '$1\\ \\text{atm}$', value: '$101.325\\ \\text{kPa}$' },
]

const SOLUBILITY = [
  'All nitrates ($\\text{NO}_3^-$) are soluble.',
  'All Group IA and $\\text{NH}_4^+$ salts are soluble.',
  'Halides ($\\text{Cl}^-$, $\\text{Br}^-$, $\\text{I}^-$) are soluble except with $\\text{Ag}^+$, $\\text{Hg}_2^{2+}$, $\\text{Pb}^{2+}$.',
  'Sulfates ($\\text{SO}_4^{2-}$) are soluble except $\\text{BaSO}_4$, $\\text{PbSO}_4$, $\\text{CaSO}_4$.',
  'Most carbonates ($\\text{CO}_3^{2-}$), phosphates ($\\text{PO}_4^{3-}$), and sulfides ($\\text{S}^{2-}$) are insoluble.',
  'Most hydroxides ($\\text{OH}^-$) are insoluble except Group IA, $\\text{Ca}^{2+}$, $\\text{Sr}^{2+}$, $\\text{Ba}^{2+}$.',
]

function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '10px',
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'var(--accent)',
      fontFamily: 'var(--font-outfit)',
      marginBottom: '12px',
    }}>
      {children}
    </div>
  )
}

import React from 'react'

export default function ChemConstants() {
  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <SectionHead>Selected Constants</SectionHead>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {CONSTANTS.map(({ symbol, value }, i) => (
              <tr
                key={i}
                style={{ borderBottom: '1px solid color-mix(in srgb, var(--bg-border) 60%, transparent)' }}
              >
                <td style={{
                  padding: '7px 16px 7px 0',
                  whiteSpace: 'nowrap',
                  width: '60px',
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  fontWeight: 600,
                }}>
                  <InlineMath text={symbol} />
                </td>
                <td style={{
                  padding: '7px 0',
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                }}>
                  <InlineMath text={value} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <SectionHead>Solubility Rules</SectionHead>
        {SOLUBILITY.map((rule, i) => (
          <div
            key={i}
            style={{
              padding: '7px 0',
              borderBottom: '1px solid color-mix(in srgb, var(--bg-border) 60%, transparent)',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
            }}
          >
            <InlineMath text={rule} />
          </div>
        ))}
      </div>
    </div>
  )
}
