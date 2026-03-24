'use client'
import KatexRenderer from '@/components/KatexRenderer'

interface Props {
  formulas: { name: string; katex_string: string }[]
}

export default function FormulasSection({ formulas }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {formulas.map((formula, idx) => (
        <div
          key={idx}
          style={{
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
          }}
        >
          <div
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: '8px',
            }}
          >
            {formula.name}
          </div>
          <div style={{ textAlign: 'center' }}>
            <KatexRenderer formula={formula.katex_string} displayMode={true} />
          </div>
        </div>
      ))}
    </div>
  )
}
