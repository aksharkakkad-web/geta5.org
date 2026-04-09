'use client'

import React from 'react'
import InlineMath from '@/components/InlineMath'

function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '10px',
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'var(--accent)',
      fontFamily: 'var(--font-outfit)',
      marginBottom: '10px',
    }}>
      {children}
    </div>
  )
}

function FormulaRow({ formula, label }: { formula: string; label?: string }) {
  return (
    <div style={{ marginBottom: label ? '12px' : '5px' }}>
      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        <InlineMath text={formula} />
      </div>
      {label && (
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '1px' }}>
          {label}
        </div>
      )}
    </div>
  )
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid var(--bg-border)' }}>
      {children}
    </div>
  )
}

export default function ChemReferenceSheet() {
  return (
    <div>
      <Section>
        <SectionHead>Atomic Structure</SectionHead>
        <FormulaRow formula="$E = h\nu$" />
        <FormulaRow formula="$\lambda\nu = c$" />
        <FormulaRow formula="$E_n = -2.178 \times 10^{-18}\ \text{J} \left(\dfrac{Z^2}{n^2}\right)$" />
      </Section>

      <Section>
        <SectionHead>Equilibrium</SectionHead>
        <FormulaRow formula="$K_a \times K_b = K_w$" />
        <FormulaRow formula="$K_p = K_c(RT)^{\Delta n}$" />
        <FormulaRow formula="$\text{pH} = -\log[\text{H}^+]$" />
        <FormulaRow formula="$\text{pOH} = -\log[\text{OH}^-]$" />
        <FormulaRow formula="$\text{pH} + \text{pOH} = 14$" />
        <FormulaRow
          formula="$\text{pH} = \text{p}K_a + \log\dfrac{[\text{A}^-]}{[\text{HA}]}$"
          label="Henderson-Hasselbalch equation"
        />
      </Section>

      <Section>
        <SectionHead>Kinetics</SectionHead>
        <FormulaRow formula="$\ln[\text{A}]_t - \ln[\text{A}]_0 = -kt$" label="First-order integrated rate law" />
        <FormulaRow formula="$\dfrac{1}{[\text{A}]_t} - \dfrac{1}{[\text{A}]_0} = kt$" label="Second-order integrated rate law" />
        <FormulaRow formula="$t_{1/2} = \dfrac{0.693}{k}$" label="First-order half-life" />
        <FormulaRow formula="$k = Ae^{-E_a/RT}$" label="Arrhenius equation" />
      </Section>

      <Section>
        <SectionHead>Gases, Liquids &amp; Solutions</SectionHead>
        <FormulaRow formula="$PV = nRT$" label="Ideal gas law" />
        <FormulaRow formula="$P_A = X_A \times P_{\text{total}}$" label="Dalton's law of partial pressures" />
        <FormulaRow formula="$\Delta T_f = i \times m \times K_f$" label="Freezing-point depression" />
        <FormulaRow formula="$\Delta T_b = i \times m \times K_b$" label="Boiling-point elevation" />
        <FormulaRow formula="$\pi = iMRT$" label="Osmotic pressure" />
      </Section>

      <Section>
        <SectionHead>Thermodynamics</SectionHead>
        <FormulaRow formula="$\Delta G^\circ = \Delta H^\circ - T\Delta S^\circ$" />
        <FormulaRow formula="$\Delta G^\circ = -RT\ln K$" />
        <FormulaRow formula="$\Delta G^\circ = -nFE^\circ_{\text{cell}}$" />
        <FormulaRow formula="$\Delta S^\circ_{\text{rxn}} = \sum\Delta S^\circ_{\text{prod}} - \sum\Delta S^\circ_{\text{react}}$" />
        <FormulaRow formula="$\Delta H^\circ_{\text{rxn}} = \sum\Delta H^\circ_f(\text{prod}) - \sum\Delta H^\circ_f(\text{react})$" />
      </Section>

      <div>
        <SectionHead>Electrochemistry</SectionHead>
        <FormulaRow formula="$E^\circ_{\text{cell}} = E^\circ_{\text{cathode}} - E^\circ_{\text{anode}}$" />
        <FormulaRow formula="$\Delta G^\circ = -nFE^\circ_{\text{cell}}$" />
        <FormulaRow formula="$\ln K = \dfrac{nFE^\circ}{RT}$" />
        <FormulaRow formula="$E = E^\circ - \dfrac{RT}{nF}\ln Q$" label="Nernst equation" />
      </div>
    </div>
  )
}
