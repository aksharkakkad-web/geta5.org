'use client'

import { useState, useEffect } from 'react'

interface Stats {
  totalEvents: number
  uniqueUsers: number
  questionsAnswered: number
  bySubject: Record<string, number>
  byDay: Record<string, { events: number; users: number }>
  byType: Record<string, number>
  recentEvents: { event_type: string; subject: string; unit: string; created_at: string }[]
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (res.ok) {
      setAuthed(true)
    } else {
      setError('Invalid credentials')
    }
  }

  useEffect(() => {
    if (!authed) return
    setLoading(true)
    fetch('/api/admin/stats')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setStats)
      .catch(() => setAuthed(false))
      .finally(() => setLoading(false))
  }, [authed])

  if (!authed) {
    return (
      <div style={{ maxWidth: '360px', margin: '120px auto', padding: '24px' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '24px' }}>
          Admin
        </h1>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{
              padding: '10px 12px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--bg-border)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              padding: '10px 12px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--bg-border)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
            }}
          />
          {error && <p style={{ color: '#ef4444', fontSize: '0.8rem' }}>{error}</p>}
          <button
            type="submit"
            style={{
              padding: '10px',
              backgroundColor: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            Log in
          </button>
        </form>
      </div>
    )
  }

  if (loading || !stats) {
    return (
      <div style={{ padding: '48px 24px', color: 'var(--text-secondary)', textAlign: 'center' }}>
        Loading stats...
      </div>
    )
  }

  const sortedDays = Object.entries(stats.byDay).sort(([a], [b]) => b.localeCompare(a)).slice(0, 14)
  const sortedSubjects = Object.entries(stats.bySubject).sort(([, a], [, b]) => b - a)
  const sortedTypes = Object.entries(stats.byType).sort(([, a], [, b]) => b - a)

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '32px' }}>
        Dashboard
      </h1>

      {/* Top-level stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <StatCard label="Unique Users" value={stats.uniqueUsers} />
        <StatCard label="Questions Answered" value={stats.questionsAnswered} />
        <StatCard label="Total Events" value={stats.totalEvents} />
      </div>

      {/* Daily breakdown */}
      <Section title="Last 14 Days">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--bg-border)' }}>
              <Th>Date</Th><Th>Users</Th><Th>Events</Th>
            </tr>
          </thead>
          <tbody>
            {sortedDays.map(([day, v]) => (
              <tr key={day} style={{ borderBottom: '1px solid var(--bg-border)' }}>
                <Td>{day}</Td><Td>{v.users}</Td><Td>{v.events}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* By subject */}
      <Section title="Events by Subject">
        {sortedSubjects.map(([subject, count]) => (
          <div key={subject} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--bg-border)', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--text-primary)' }}>{subject}</span>
            <span style={{ color: 'var(--text-secondary)' }}>{count}</span>
          </div>
        ))}
      </Section>

      {/* By event type */}
      <Section title="Events by Type">
        {sortedTypes.map(([type, count]) => (
          <div key={type} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--bg-border)', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{type}</span>
            <span style={{ color: 'var(--text-secondary)' }}>{count}</span>
          </div>
        ))}
      </Section>

      {/* Recent events */}
      <Section title="Recent Activity">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--bg-border)' }}>
              <Th>Time</Th><Th>Type</Th><Th>Subject</Th><Th>Unit</Th>
            </tr>
          </thead>
          <tbody>
            {stats.recentEvents.map((e, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--bg-border)' }}>
                <Td>{new Date(e.created_at).toLocaleString()}</Td>
                <Td><code>{e.event_type}</code></Td>
                <Td>{e.subject}</Td>
                <Td>{e.unit || '—'}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--bg-border)',
      borderRadius: '12px',
      padding: '20px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
        {value.toLocaleString()}
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
        {label}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{ textAlign: 'left', padding: '8px 4px', color: 'var(--text-secondary)', fontWeight: 500 }}>
      {children}
    </th>
  )
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td style={{ padding: '8px 4px', color: 'var(--text-primary)' }}>
      {children}
    </td>
  )
}
