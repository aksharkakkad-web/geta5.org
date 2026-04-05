'use client'

import { useState, useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

interface Stats {
  overview: {
    uniqueUsers: number
    totalEvents: number
    totalDrillSessions: number
    totalMCQSessions: number
    totalTests: number
    totalGuideViews: number
    drillAnswers: number
    mcqAnswers: number
    testAnswers: number
    totalAnswers: number
    totalCorrect: number
  }
  averages: {
    drillAccuracy: number
    mcqAccuracy: number
    testAccuracy: number
    drillCardsPerSession: number
    mcqQuestionsPerSession: number
  }
  time: { totalMs: number; drillMs: number; mcqMs: number; testMs: number }
  bySubject: { subject: string; drills: number; mcqs: number; tests: number; guides: number }[]
  daily: { day: string; events: number; users: number; drills: number; mcqs: number; tests: number; guides: number }[]
  recentEvents: { event_type: string; subject: string; unit: string; created_at: string }[]
}

function fmt(ms: number): string {
  if (ms === 0) return '0m'
  const mins = Math.floor(ms / 60000)
  const hrs = Math.floor(mins / 60)
  if (hrs > 0) return `${hrs}h ${mins % 60}m`
  return `${mins}m`
}

function pct(n: number): string { return `${(n * 100).toFixed(1)}%` }

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(false)
  const [empty, setEmpty] = useState(false)
  const [dbError, setDbError] = useState('')
  const [tab, setTab] = useState<'analytics' | 'users'>('analytics')
  const [users, setUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [usersLoading, setUsersLoading] = useState(false)

  const fetchUsers = async () => {
    setUsersLoading(true)
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'x-admin-password': password },
      })
      const data = await res.json()
      setUsers(data.users ?? [])
    } catch {} finally { setUsersLoading(false) }
  }

  const fetchUserDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/user/${id}`, {
        headers: { 'x-admin-password': password },
      })
      const data = await res.json()
      setSelectedUser(data)
    } catch {}
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (res.ok) setAuthed(true)
    else setError('Invalid credentials')
  }

  useEffect(() => {
    if (!authed) return
    setLoading(true)
    fetch('/api/admin/stats')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        if (data.error) setDbError(data.error)
        if (data.empty) setEmpty(true)
        else setStats(data)
      })
      .catch(() => setAuthed(false))
      .finally(() => setLoading(false))
  }, [authed])

  // ─── Login ──────────────────────────────────────────────
  if (!authed) {
    return (
      <div style={{ maxWidth: '340px', margin: '140px auto', padding: '0 24px' }}>
        <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>Admin</h1>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} style={inputStyle} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
          {error && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: 0 }}>{error}</p>}
          <button type="submit" style={{ ...btnStyle, marginTop: '4px' }}>Log in</button>
        </form>
      </div>
    )
  }

  if (loading) return <Center>Loading...</Center>
  if (empty) return <Center>{dbError ? `Database error: ${dbError}` : 'No events yet. Start using the app to generate data.'}</Center>
  if (!stats) return <Center>Error loading stats.</Center>

  const { overview: o, averages: a, time: t } = stats

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '28px 24px 64px' }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px' }}>Dashboard</h1>

      {/* ── Tab Bar ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button onClick={() => setTab('analytics')} style={{
          padding: '8px 20px',
          borderRadius: '8px',
          border: 'none',
          background: tab === 'analytics' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)',
          color: tab === 'analytics' ? '#a78bfa' : 'var(--text-secondary)',
          cursor: 'pointer',
          fontSize: '0.85rem',
          fontWeight: 600,
        }}>Analytics</button>
        <button onClick={() => { setTab('users'); if (users.length === 0) fetchUsers() }} style={{
          padding: '8px 20px',
          borderRadius: '8px',
          border: 'none',
          background: tab === 'users' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)',
          color: tab === 'users' ? '#a78bfa' : 'var(--text-secondary)',
          cursor: 'pointer',
          fontSize: '0.85rem',
          fontWeight: 600,
        }}>Users</button>
      </div>

      {/* ── Users Tab ── */}
      {tab === 'users' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <SectionTitle>All Users ({users.length})</SectionTitle>
            <button onClick={fetchUsers} style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.75rem' }}>
              Refresh
            </button>
          </div>
          {usersLoading ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', padding: '24px 0' }}>Loading users...</div>
          ) : (
            <div style={{ ...cardBg, padding: '0', overflow: 'hidden', marginBottom: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--bg-border)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                    <Th left>Email</Th><Th left>Display Name</Th><Th>Questions</Th><Th>Streak</Th><Th>Last Active</Th><Th>Signed Up</Th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>No users found.</td></tr>
                  ) : users.map(u => (
                    <tr
                      key={u.id}
                      onClick={() => { setSelectedUser(null); fetchUserDetail(u.id) }}
                      style={{ borderBottom: '1px solid var(--bg-border)', cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <Td left>{u.email}</Td>
                      <Td left>{u.displayName || '—'}</Td>
                      <Td>{u.totalQuestions.toLocaleString()}</Td>
                      <Td>{u.streakCount}</Td>
                      <Td>{new Date(u.lastActive).toLocaleDateString()}</Td>
                      <Td>{new Date(u.createdAt).toLocaleDateString()}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── User Detail Panel ── */}
          {selectedUser && (
            <div style={{ ...cardBg, padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{selectedUser.profile?.email}</div>
                  {selectedUser.profile?.display_name && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{selectedUser.profile.display_name}</div>
                  )}
                </div>
                <button onClick={() => setSelectedUser(null)} style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.75rem' }}>
                  Close
                </button>
              </div>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Questions: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{(selectedUser.stats?.total_questions ?? 0).toLocaleString()}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Streak: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{selectedUser.stats?.streak_count ?? 0}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Joined: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{new Date(selectedUser.profile?.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              {selectedUser.progress && selectedUser.progress.length > 0 && (
                <>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>Subject Progress</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--bg-border)' }}>
                        <Th left>Subject</Th><Th left>Unit</Th><Th>Drill Acc.</Th><Th>MCQ Acc.</Th><Th>Attempts</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedUser.progress.map((p: any, i: number) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--bg-border)' }}>
                          <Td left>{p.subject}</Td>
                          <Td left>{p.unit}</Td>
                          <Td>{p.drill_accuracy != null ? pct(p.drill_accuracy) : '—'}</Td>
                          <Td>{p.mcq_accuracy != null ? pct(p.mcq_accuracy) : '—'}</Td>
                          <Td>{p.total_attempts ?? 0}</Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
              {(!selectedUser.progress || selectedUser.progress.length === 0) && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>No progress data yet.</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Analytics Tab ── */}
      {tab === 'analytics' && <>

      {/* ── Top Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '28px' }}>
        <Card label="Unique Users" value={o.uniqueUsers} />
        <Card label="Questions Answered" value={o.totalAnswers} />
        <Card label="Correct" value={o.totalAnswers > 0 ? pct(o.totalCorrect / o.totalAnswers) : '—'} sub={`${o.totalCorrect.toLocaleString()} of ${o.totalAnswers.toLocaleString()}`} />
        <Card label="Sessions" value={o.totalDrillSessions + o.totalMCQSessions + o.totalTests} />
        <Card label="Total Time" value={fmt(t.totalMs)} />
      </div>

      {/* ── Mode Breakdown ── */}
      <SectionTitle>By Mode</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px' }}>
        <ModeCard title="Drills" sessions={o.totalDrillSessions} questions={o.drillAnswers} time={fmt(t.drillMs)} avg={`${a.drillCardsPerSession.toFixed(0)} cards/session`} accuracy={pct(a.drillAccuracy)} />
        <ModeCard title="Practice MCQs" sessions={o.totalMCQSessions} questions={o.mcqAnswers} time={fmt(t.mcqMs)} avg={`${a.mcqQuestionsPerSession.toFixed(0)} q/session`} accuracy={pct(a.mcqAccuracy)} />
        <ModeCard title="Practice Tests" sessions={o.totalTests} questions={o.testAnswers} time={fmt(t.testMs)} avg="" accuracy={pct(a.testAccuracy)} />
        <ModeCard title="Study Guides" sessions={o.totalGuideViews} questions={0} time="—" avg="" accuracy="" />
      </div>

      {/* ── Charts ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
        <ChartBox title="Daily Activity (30d)">
          <DailyChart data={stats.daily} />
        </ChartBox>
        <ChartBox title="Sessions by Subject">
          <SubjectChart data={stats.bySubject} />
        </ChartBox>
      </div>

      {/* ── By Subject Table ── */}
      <SectionTitle>Subject Breakdown</SectionTitle>
      <div style={{ ...cardBg, padding: '0', overflow: 'hidden', marginBottom: '28px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--bg-border)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <Th left>Subject</Th><Th>Drills</Th><Th>MCQs</Th><Th>Tests</Th><Th>Guides</Th><Th>Total</Th>
            </tr>
          </thead>
          <tbody>
            {stats.bySubject.map(s => (
              <tr key={s.subject} style={{ borderBottom: '1px solid var(--bg-border)' }}>
                <Td left>{s.subject.replace('ap-', 'AP ').replace(/-/g, ' ')}</Td>
                <Td>{s.drills}</Td><Td>{s.mcqs}</Td><Td>{s.tests}</Td><Td>{s.guides}</Td>
                <Td bold>{s.drills + s.mcqs + s.tests + s.guides}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Recent Activity ── */}
      <SectionTitle>Recent Activity</SectionTitle>
      <div style={{ ...cardBg, padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.7rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--bg-border)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <Th left>Time</Th><Th left>Event</Th><Th left>Subject</Th><Th left>Unit</Th>
            </tr>
          </thead>
          <tbody>
            {stats.recentEvents.map((e, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--bg-border)' }}>
                <Td left>{new Date(e.created_at).toLocaleString()}</Td>
                <Td left><code style={{ color: 'var(--accent)', fontSize: '0.7rem' }}>{e.event_type}</code></Td>
                <Td left>{e.subject}</Td>
                <Td left>{e.unit || '—'}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      </>}
    </div>
  )
}

// ─── Charts ────────────────────────────────────────────────

function DailyChart({ data }: { data: Stats['daily'] }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (!ref.current || data.length === 0) return
    const ctx = ref.current.getContext('2d')!
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.day.slice(5)),
        datasets: [
          { label: 'Users', data: data.map(d => d.users), backgroundColor: '#06b6d4', borderRadius: 3, barPercentage: 0.6 },
          { label: 'Drills', data: data.map(d => d.drills), backgroundColor: '#8b5cf6', borderRadius: 3, barPercentage: 0.6 },
          { label: 'MCQs', data: data.map(d => d.mcqs), backgroundColor: '#10b981', borderRadius: 3, barPercentage: 0.6 },
          { label: 'Tests', data: data.map(d => d.tests), backgroundColor: '#f59e0b', borderRadius: 3, barPercentage: 0.6 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#94a3b8', font: { size: 10 } } } },
        scales: {
          x: { ticks: { color: '#64748b', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
          y: { ticks: { color: '#64748b', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.04)' }, beginAtZero: true },
        },
      },
    })
    return () => chart.destroy()
  }, [data])
  return <canvas ref={ref} style={{ width: '100%', height: '220px' }} />
}

function SubjectChart({ data }: { data: Stats['bySubject'] }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (!ref.current || data.length === 0) return
    const ctx = ref.current.getContext('2d')!
    const labels = data.map(s => s.subject.replace('ap-', '').replace(/-/g, ' '))
    const totals = data.map(s => s.drills + s.mcqs + s.tests + s.guides)
    const colors = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1']
    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data: totals, backgroundColor: colors.slice(0, data.length), borderWidth: 0 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 10 }, padding: 8 } } },
      },
    })
    return () => chart.destroy()
  }, [data])
  return <canvas ref={ref} style={{ width: '100%', height: '220px' }} />
}

// ─── UI Components ──────────────────────────────────────────

const cardBg: React.CSSProperties = {
  backgroundColor: 'var(--bg-secondary)',
  border: '1px solid var(--bg-border)',
  borderRadius: '10px',
}

const inputStyle: React.CSSProperties = {
  padding: '9px 12px',
  backgroundColor: 'var(--bg-secondary)',
  border: '1px solid var(--bg-border)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  fontSize: '0.8rem',
  outline: 'none',
}

const btnStyle: React.CSSProperties = {
  padding: '9px',
  backgroundColor: 'var(--accent)',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: '0.8rem',
}

function Center({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: '120px 24px', color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.875rem' }}>{children}</div>
}

function Card({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{ ...cardBg, padding: '16px', textAlign: 'center' }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>{typeof value === 'number' ? value.toLocaleString() : value}</div>
      <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.6rem', color: 'var(--text-muted, #64748b)', marginTop: '2px' }}>{sub}</div>}
    </div>
  )
}

function ModeCard({ title, sessions, questions, time, avg, accuracy }: { title: string; sessions: number; questions: number; time: string; avg: string; accuracy: string }) {
  return (
    <div style={{ ...cardBg, padding: '14px' }}>
      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>{title}</div>
      <Row label="Sessions" value={sessions} />
      {questions > 0 && <Row label="Questions" value={questions} />}
      <Row label="Time" value={time} />
      {avg && <Row label="Avg" value={avg} />}
      {accuracy && <Row label="Accuracy" value={accuracy} />}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', padding: '3px 0' }}>
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{typeof value === 'number' ? value.toLocaleString() : value}</span>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>{children}</h2>
}

function ChartBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ ...cardBg, padding: '16px' }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{title}</div>
      <div style={{ height: '220px' }}>{children}</div>
    </div>
  )
}

function Th({ children, left }: { children: React.ReactNode; left?: boolean }) {
  return <th style={{ textAlign: left ? 'left' : 'right', padding: '10px 12px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.7rem' }}>{children}</th>
}

function Td({ children, left, bold }: { children: React.ReactNode; left?: boolean; bold?: boolean }) {
  return <td style={{ textAlign: left ? 'left' : 'right', padding: '8px 12px', color: 'var(--text-primary)', fontWeight: bold ? 600 : 400 }}>{children}</td>
}
