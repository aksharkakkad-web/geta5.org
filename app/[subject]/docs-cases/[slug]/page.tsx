import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import fs from 'fs'
import path from 'path'
import { getSubject } from '@/utils/subjects'
import { hasDocsCases, kickerForItem, type DocsCasesData, type DocCaseItem } from '@/utils/docsCases'
import { AdiQuizBlock } from '@/components/docs-cases/AdiQuizBlock'
import { DocCaseSections } from '@/components/docs-cases/DocCaseSections'

interface PageProps {
  params: Promise<{ subject: string; slug: string }>
}

function loadData(subject: string): DocsCasesData | null {
  try {
    const file = path.join(process.cwd(), 'public', 'data', subject, 'docs-cases.json')
    const raw = fs.readFileSync(file, 'utf-8')
    return JSON.parse(raw) as DocsCasesData
  } catch {
    return null
  }
}

function findItem(data: DocsCasesData, slug: string): DocCaseItem | null {
  return data.items.find(i => i.id === slug) ?? null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { subject: subjectSlug, slug } = await params
  const data = loadData(subjectSlug)
  const item = data ? findItem(data, slug) : null
  if (!item) return {}
  return {
    title: `${item.title} — AP Gov Docs & Cases | geta5.app`,
    description: item.key_takeaway,
  }
}

export async function generateStaticParams() {
  try {
    const file = path.join(process.cwd(), 'public', 'data', 'ap-government', 'docs-cases.json')
    const raw = fs.readFileSync(file, 'utf-8')
    const data = JSON.parse(raw) as DocsCasesData
    return data.items.map(i => ({ subject: 'ap-government', slug: i.id }))
  } catch {
    return []
  }
}

export default async function DocCaseDetailPage({ params }: PageProps) {
  const { subject: subjectSlug, slug } = await params
  const subject = getSubject(subjectSlug)
  if (!subject || !hasDocsCases(subjectSlug)) notFound()
  const data = loadData(subjectSlug)
  const item = data ? findItem(data, slug) : null
  if (!item) notFound()

  const kicker = kickerForItem(item)

  return (
    <div style={{
      maxWidth: '54rem',
      margin: '0 auto',
      paddingLeft: '24px',
      paddingRight: '24px',
      paddingTop: '32px',
      paddingBottom: '64px',
    }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
        <Link href={`/${subjectSlug}`} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>{subject.name}</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <Link href={`/${subjectSlug}/docs-cases`} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Docs &amp; Cases</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        {item.title}
      </div>

      {/* Hero */}
      <div style={{
        padding: '32px 36px',
        background: 'linear-gradient(160deg, rgba(99,102,241,0.12) 0%, var(--bg-card) 70%)',
        border: '1px solid var(--bg-border)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '24px',
      }}>
        <div style={{
          fontSize: '0.75rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--accent)',
          marginBottom: '12px',
          fontWeight: 600,
        }}>
          {kicker}
        </div>
        <h1 style={{
          fontSize: '1.875rem',
          fontWeight: 700,
          margin: '0 0 8px 0',
          lineHeight: 1.15,
          color: 'var(--text-primary)',
        }}>
          {item.title}
        </h1>
        <p style={{
          fontSize: '0.9375rem',
          color: 'var(--text-secondary)',
          margin: 0,
        }}>
          {item.type === 'document' && item.author ? `${item.author} · ${item.byline}` : item.byline}
          {item.type === 'case' && item.vote ? ` · ${item.vote}` : ''}
        </p>
      </div>

      {/* Key Takeaway */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--bg-border)',
        borderLeft: '3px solid var(--accent)',
        borderRadius: 'var(--radius-md)',
        padding: '20px 24px',
        marginBottom: '24px',
      }}>
        <div style={{
          fontSize: '0.6875rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--accent)',
          fontWeight: 600,
          marginBottom: '8px',
        }}>
          Key Takeaway
        </div>
        <p style={{
          margin: 0,
          fontSize: '1rem',
          color: 'var(--text-primary)',
          lineHeight: 1.5,
        }}>
          {item.key_takeaway}
        </p>
      </div>

      {/* Summary */}
      <section style={{ marginBottom: '24px' }}>
        <h4 style={{
          fontSize: '0.75rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          fontWeight: 600,
          margin: '0 0 10px 0',
        }}>
          Summary — what to remember
        </h4>
        <p style={{
          fontSize: '0.9375rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.65,
          margin: 0,
        }}>
          {item.summary}
        </p>
      </section>

      {/* Meta grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '12px',
        marginBottom: '28px',
      }}>
        <MetaCell label="Key Terms" value={item.key_terms.join(' · ')} />
        <MetaCell
          label="Often paired with"
          valueNode={
            item.paired_with.length > 0 ? (
              <span>
                {item.paired_with.map((p, idx) => (
                  <span key={p.id}>
                    {idx > 0 && ' · '}
                    <Link
                      href={`/${subjectSlug}/docs-cases/${p.id}`}
                      style={{ color: 'var(--text-primary)', textDecoration: 'underline', textDecorationColor: 'var(--bg-border)' }}
                    >
                      {p.title}
                    </Link>
                    <span style={{ color: 'var(--text-muted)' }}> ({p.relation})</span>
                  </span>
                ))}
              </span>
            ) : (
              <span>—</span>
            )
          }
        />
        {item.constitutional_link && <MetaCell label="Constitutional link" value={item.constitutional_link} />}
        <MetaCell label="Exam appearance" value={item.exam_appearance} />
      </div>

      {/* Structured breakdown (e.g. articles, amendments) */}
      {item.sections && item.sections.length > 0 && (
        <DocCaseSections
          heading={sectionsHeading(item)}
          sections={item.sections}
        />
      )}

      {/* Adi CTA block */}
      <AdiQuizBlock
        itemTitle={item.title}
        quizPrompt={item.adi_prompts.quiz}
        explainPrompt={item.adi_prompts.explain}
      />
    </div>
  )
}

function sectionsHeading(item: DocCaseItem): string {
  if (item.id === 'us-constitution') return 'Articles — what each one covers'
  if (item.id === 'constitutional-amendments') return 'Amendments — what each one does'
  return 'Breakdown'
}

function MetaCell({ label, value, valueNode }: { label: string; value?: string; valueNode?: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--bg-border)',
      borderRadius: 'var(--radius-md)',
      padding: '16px 18px',
    }}>
      <div style={{
        fontSize: '0.6875rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        fontWeight: 600,
        marginBottom: '8px',
      }}>
        {label}
      </div>
      <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
        {valueNode ?? value}
      </div>
    </div>
  )
}
