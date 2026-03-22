// components/TableRenderer.tsx
export interface TableData {
  headers: string[]
  rows: string[][]
}

interface Props {
  data: TableData
  className?: string
}

export default function TableRenderer({ data, className = '' }: Props) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '0.9rem',
        color: 'var(--text-primary)',
      }}>
        <thead>
          <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
            {data.headers.map((h, i) => (
              <th key={i} style={{
                padding: '10px 14px',
                textAlign: 'left',
                fontWeight: 600,
                borderBottom: '1px solid var(--bg-border)',
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, i) => (
            <tr key={i} style={{
              backgroundColor: i % 2 === 0 ? 'transparent' : 'var(--bg-secondary)',
            }}>
              {row.map((cell, j) => (
                <td key={j} style={{
                  padding: '9px 14px',
                  borderBottom: '1px solid var(--bg-border)',
                  verticalAlign: 'top',
                  lineHeight: 1.5,
                }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
