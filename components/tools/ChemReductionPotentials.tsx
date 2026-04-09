'use client'

import InlineMath from '@/components/InlineMath'

const REDUCTIONS = [
  { reaction: '$\\text{F}_2 + 2e^- \\to 2\\text{F}^-$', eo: '+2.87' },
  { reaction: '$\\text{Co}^{3+} + e^- \\to \\text{Co}^{2+}$', eo: '+1.82' },
  { reaction: '$\\text{Au}^{3+} + 3e^- \\to \\text{Au}$', eo: '+1.52' },
  { reaction: '$\\text{Cl}_2 + 2e^- \\to 2\\text{Cl}^-$', eo: '+1.36' },
  { reaction: '$\\text{O}_2 + 4\\text{H}^+ + 4e^- \\to 2\\text{H}_2\\text{O}$', eo: '+1.23' },
  { reaction: '$\\text{Br}_2 + 2e^- \\to 2\\text{Br}^-$', eo: '+1.07' },
  { reaction: '$\\text{Hg}_2^{2+} + 2e^- \\to 2\\text{Hg}$', eo: '+0.85' },
  { reaction: '$\\text{Ag}^+ + e^- \\to \\text{Ag}$', eo: '+0.80' },
  { reaction: '$\\text{Fe}^{3+} + e^- \\to \\text{Fe}^{2+}$', eo: '+0.77' },
  { reaction: '$\\text{MnO}_4^- + 2\\text{H}_2\\text{O} + 3e^- \\to \\text{MnO}_2 + 4\\text{OH}^-$', eo: '+0.60' },
  { reaction: '$\\text{I}_2 + 2e^- \\to 2\\text{I}^-$', eo: '+0.54' },
  { reaction: '$\\text{O}_2 + 2\\text{H}_2\\text{O} + 4e^- \\to 4\\text{OH}^-$', eo: '+0.40' },
  { reaction: '$\\text{Cu}^{2+} + 2e^- \\to \\text{Cu}$', eo: '+0.34' },
  { reaction: '$\\text{Cu}^{2+} + e^- \\to \\text{Cu}^+$', eo: '+0.15' },
  { reaction: '$2\\text{H}^+ + 2e^- \\to \\text{H}_2$', eo: '0.00' },
  { reaction: '$\\text{Fe}^{3+} + 3e^- \\to \\text{Fe}$', eo: '−0.04' },
  { reaction: '$\\text{Pb}^{2+} + 2e^- \\to \\text{Pb}$', eo: '−0.13' },
  { reaction: '$\\text{Sn}^{2+} + 2e^- \\to \\text{Sn}$', eo: '−0.14' },
  { reaction: '$\\text{Ni}^{2+} + 2e^- \\to \\text{Ni}$', eo: '−0.25' },
  { reaction: '$\\text{Co}^{2+} + 2e^- \\to \\text{Co}$', eo: '−0.28' },
  { reaction: '$\\text{Fe}^{2+} + 2e^- \\to \\text{Fe}$', eo: '−0.44' },
  { reaction: '$\\text{Cr}^{3+} + 3e^- \\to \\text{Cr}$', eo: '−0.74' },
  { reaction: '$\\text{Zn}^{2+} + 2e^- \\to \\text{Zn}$', eo: '−0.76' },
  { reaction: '$2\\text{H}_2\\text{O} + 2e^- \\to \\text{H}_2 + 2\\text{OH}^-$', eo: '−0.83' },
  { reaction: '$\\text{Mn}^{2+} + 2e^- \\to \\text{Mn}$', eo: '−1.18' },
  { reaction: '$\\text{Al}^{3+} + 3e^- \\to \\text{Al}$', eo: '−1.66' },
  { reaction: '$\\text{Mg}^{2+} + 2e^- \\to \\text{Mg}$', eo: '−2.37' },
  { reaction: '$\\text{Na}^+ + e^- \\to \\text{Na}$', eo: '−2.71' },
  { reaction: '$\\text{Ca}^{2+} + 2e^- \\to \\text{Ca}$', eo: '−2.87' },
  { reaction: '$\\text{Ba}^{2+} + 2e^- \\to \\text{Ba}$', eo: '−2.91' },
  { reaction: '$\\text{K}^+ + e^- \\to \\text{K}$', eo: '−2.93' },
  { reaction: '$\\text{Li}^+ + e^- \\to \\text{Li}$', eo: '−3.05' },
]

export default function ChemReductionPotentials() {
  return (
    <div>
      <div style={{
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--accent)',
        fontFamily: 'var(--font-outfit)',
        marginBottom: '6px',
      }}>
        Standard Reduction Potentials at 25°C
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '14px' }}>
        Listed from strongest oxidizing agent (top) to strongest reducing agent (bottom).
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--bg-border)' }}>
            <th style={{
              textAlign: 'left',
              padding: '6px 12px 6px 0',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-outfit)',
            }}>
              Half-Reaction (Reduction)
            </th>
            <th style={{
              textAlign: 'right',
              padding: '6px 0',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-outfit)',
              whiteSpace: 'nowrap',
            }}>
              E° (V)
            </th>
          </tr>
        </thead>
        <tbody>
          {REDUCTIONS.map(({ reaction, eo }, i) => {
            const isStandard = eo === '0.00'
            const isPositive = eo.startsWith('+')
            return (
              <tr
                key={i}
                style={{
                  borderBottom: '1px solid color-mix(in srgb, var(--bg-border) 50%, transparent)',
                  background: isStandard
                    ? 'color-mix(in srgb, var(--accent) 6%, transparent)'
                    : 'transparent',
                }}
              >
                <td style={{
                  padding: '6px 12px 6px 0',
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.4,
                }}>
                  <InlineMath text={reaction} />
                </td>
                <td style={{
                  padding: '6px 0',
                  textAlign: 'right',
                  fontFamily: 'ui-monospace, "Cascadia Code", Consolas, monospace',
                  fontSize: '13px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  color: isStandard
                    ? 'var(--text-secondary)'
                    : isPositive
                    ? 'var(--accent-success)'
                    : 'var(--accent-danger)',
                }}>
                  {eo}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
