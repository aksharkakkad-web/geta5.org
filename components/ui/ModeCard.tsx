import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

interface ModeCardProps {
  title: string
  description: string
  Icon: LucideIcon
  href: string
}

export function ModeCard({ title, description, Icon, href }: ModeCardProps) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div className="mode-card" style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--bg-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        cursor: 'pointer',
        transition: 'background-color 150ms ease, border-color 150ms ease',
        height: '100%',
      }}>
        <Icon
          size={24}
          color="var(--accent)"
          style={{ marginBottom: '12px' }}
        />
        <h3 style={{
          fontSize: '1rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '6px',
        }}>
          {title}
        </h3>
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
        }}>
          {description}
        </p>
      </div>
    </Link>
  )
}
