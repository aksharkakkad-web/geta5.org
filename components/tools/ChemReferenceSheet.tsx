'use client'

import React from 'react'

const sectionHeaderStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--accent)',
  fontFamily: 'var(--font-outfit)',
  marginBottom: '6px',
}

const sectionStyle: React.CSSProperties = {
  paddingBottom: '12px',
  marginBottom: '12px',
  borderBottom: '1px solid var(--bg-border)',
}

const formulaLineStyle: React.CSSProperties = {
  fontSize: '11px',
  color: 'var(--text-secondary)',
  lineHeight: 1.6,
}

const subLabelStyle: React.CSSProperties = {
  fontSize: '10px',
  color: 'var(--text-muted)',
  fontStyle: 'italic',
  marginTop: '2px',
  lineHeight: 1.5,
}

export default function ChemReferenceSheet() {
  return (
    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>

      {/* ATOMIC STRUCTURE */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>Atomic Structure</div>
        <div style={formulaLineStyle}>E = h&#957;</div>
        <div style={formulaLineStyle}>&#955;&#957; = c</div>
        <div style={formulaLineStyle}>E&#8345; = &#8722;2.178 &#215; 10&#8315;&#185;&#8312; J (Z&#178;/n&#178;)</div>
      </div>

      {/* EQUILIBRIUM */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>Equilibrium</div>
        <div style={formulaLineStyle}>K&#8336; &#215; K&#8346; = K&#8361;</div>
        <div style={formulaLineStyle}>pH = &#8722;log[H&#8314;]</div>
        <div style={formulaLineStyle}>pOH = &#8722;log[OH&#8315;]</div>
        <div style={formulaLineStyle}>pH + pOH = 14</div>
        <div style={formulaLineStyle}>K&#8346; = K&#8338;(RT)&#8710;&#8319;</div>
        <div style={formulaLineStyle}>pH = pK&#8336; + log([A&#8315;]/[HA])</div>
        <div style={subLabelStyle}>Henderson-Hasselbalch equation</div>
      </div>

      {/* KINETICS */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>Kinetics</div>
        <div style={formulaLineStyle}>ln[A]&#8348; &#8722; ln[A]&#8320; = &#8722;kt</div>
        <div style={subLabelStyle}>First-order integrated rate law</div>
        <div style={{ ...formulaLineStyle, marginTop: '4px' }}>1/[A]&#8348; &#8722; 1/[A]&#8320; = kt</div>
        <div style={subLabelStyle}>Second-order integrated rate law</div>
        <div style={{ ...formulaLineStyle, marginTop: '4px' }}>t&#189; = 0.693/k</div>
        <div style={subLabelStyle}>First-order half-life</div>
        <div style={{ ...formulaLineStyle, marginTop: '4px' }}>k = Ae&#8315;&#40;E&#8336;/RT&#41;</div>
        <div style={subLabelStyle}>Arrhenius equation</div>
      </div>

      {/* GASES, LIQUIDS, SOLUTIONS */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>Gases, Liquids &amp; Solutions</div>
        <div style={formulaLineStyle}>PV = nRT</div>
        <div style={formulaLineStyle}>P&#8336; = X&#8336; &#215; P&#8348;&#8338;&#8348;&#8339;&#8339;</div>
        <div style={subLabelStyle}>Dalton&apos;s law of partial pressures</div>
        <div style={{ ...formulaLineStyle, marginTop: '4px' }}>&#916;T&#7584; = i &#215; m &#215; K&#7584;</div>
        <div style={subLabelStyle}>Freezing-point depression</div>
        <div style={{ ...formulaLineStyle, marginTop: '4px' }}>&#960; = iMRT</div>
        <div style={subLabelStyle}>Osmotic pressure</div>
      </div>

      {/* THERMODYNAMICS */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>Thermodynamics</div>
        <div style={formulaLineStyle}>&#916;G&#176; = &#916;H&#176; &#8722; T&#916;S&#176;</div>
        <div style={formulaLineStyle}>&#916;G&#176; = &#8722;RT ln K</div>
        <div style={formulaLineStyle}>&#916;G&#176; = &#8722;nFE&#176;&#8338;&#8343;&#8339;&#8339;</div>
        <div style={{ ...formulaLineStyle, marginTop: '4px' }}>&#916;S&#176;&#8319;&#820;&#8339; = &#931;&#916;S&#176;&#8346;&#8343;&#8339;&#8343; &#8722; &#931;&#916;S&#176;&#8345;&#8343;&#8338;&#8348;</div>
        <div style={{ ...formulaLineStyle }}>&#916;H&#176;&#8319;&#820;&#8339; = &#931;&#916;H&#176;&#7584;(prod) &#8722; &#931;&#916;H&#176;&#7584;(react)</div>
      </div>

      {/* ELECTROCHEMISTRY */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>Electrochemistry</div>
        <div style={formulaLineStyle}>E&#176;&#8338;&#8343;&#8339;&#8339; = E&#176;&#8338;&#8341;&#8348;&#8341;&#8338;&#8343;&#8343; &#8722; E&#176;&#8336;&#8345;&#8338;&#8343;</div>
        <div style={formulaLineStyle}>&#916;G&#176; = &#8722;nFE&#176;&#8338;&#8343;&#8339;&#8339;</div>
        <div style={formulaLineStyle}>ln K = nFE&#176;/RT</div>
      </div>

      {/* SELECTED CONSTANTS */}
      <div style={sectionStyle}>
        <div style={sectionHeaderStyle}>Selected Constants</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <tbody>
            {([
              ['R', '8.314 J mol\u207b\u00b9 K\u207b\u00b9'],
              ['R', '0.08206 L atm mol\u207b\u00b9 K\u207b\u00b9'],
              ['F', '96,485 C mol\u207b\u00b9'],
              ['N\u2090', '6.022 \u00d7 10\u00b2\u00b3 mol\u207b\u00b9'],
              ['k\u1d03', '1.381 \u00d7 10\u207b\u00b2\u00b3 J K\u207b\u00b9'],
              ['h', '6.626 \u00d7 10\u207b\u00b3\u2074 J\u00b7s'],
              ['c', '2.998 \u00d7 10\u2078 m s\u207b\u00b9'],
              ['K\u1d04', '1.0 \u00d7 10\u207b\u00b9\u2074 at 25\u00b0C'],
              ['0\u00b0C', '273.15 K'],
              ['1 atm', '101.325 kPa'],
            ] as [string, string][]).map(([symbol, value]) => (
              <tr key={symbol + value}>
                <td
                  style={{
                    paddingRight: '8px',
                    paddingBottom: '2px',
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {symbol}
                </td>
                <td style={{ color: 'var(--text-muted)', paddingBottom: '2px' }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SOLUBILITY RULES */}
      <div style={{ ...sectionStyle, borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
        <div style={sectionHeaderStyle}>Solubility Rules</div>
        <div
          style={{
            fontSize: '11px',
            color: 'var(--text-secondary)',
            lineHeight: 1.65,
          }}
        >
          All nitrates soluble. All Group IA &amp; NH&#8324;&#8314; salts soluble. Halides (Cl&#8315;, Br&#8315;, I&#8315;) soluble except with Ag&#8314;, Hg&#8322;&#178;&#8314;, Pb&#178;&#8314;. Sulfates soluble except Ba&#178;&#8314;, Pb&#178;&#8314;, Ca&#178;&#8314;. Most carbonates, phosphates, and sulfides insoluble. Most hydroxides insoluble except Group IA, Ca&#178;&#8314;, Sr&#178;&#8314;, Ba&#178;&#8314;.
        </div>
      </div>
    </div>
  )
}
