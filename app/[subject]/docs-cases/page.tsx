import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import fs from 'fs'
import path from 'path'
import { getSubject } from '@/utils/subjects'
import { hasDocsCases, type DocsCasesData } from '@/utils/docsCases'
import { BackToSubject } from '@/components/ui/BackToSubject'
import { DocsCasesHubClient } from '@/components/docs-cases/DocsCasesHubClient'

interface PageProps {
  params: Promise<{ subject: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { subject: slug } = await params
  const subject = getSubject(slug)
  if (!subject || !hasDocsCases(slug)) return {}
  return {
    title: `Required Docs & Cases — ${subject.name} | geta5.app`,
    description: `Concise summaries of all 9 foundational documents and 15 Supreme Court cases required for AP US Government and Politics.`,
  }
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

export default async function DocsCasesHubPage({ params }: PageProps) {
  const { subject: slug } = await params
  const subject = getSubject(slug)
  if (!subject || !hasDocsCases(slug)) notFound()
  const data = loadData(slug)
  if (!data) notFound()

  return (
    <div style={{
      maxWidth: '90rem',
      margin: '0 auto',
      paddingLeft: '24px',
      paddingRight: '24px',
      paddingTop: '32px',
      paddingBottom: '64px',
      position: 'relative',
    }}>
      <div style={{ marginBottom: '16px' }}>
        <BackToSubject subject={slug} />
      </div>
      <h1 style={{
        fontSize: '1.875rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
        lineHeight: 1.2,
        margin: '0 0 8px 0',
      }}>
        Required Documents &amp; Cases
      </h1>
      <p style={{
        fontSize: '0.9375rem',
        color: 'var(--text-secondary)',
        margin: '0 0 32px 0',
        maxWidth: '70ch',
      }}>
        Memorize these {data.items.length} — they appear by name in MCQs and FRQs every year. Each entry has a one-sentence key takeaway and a concise summary of what you need to remember.
      </p>

      <DocsCasesHubClient items={data.items} subject={slug} />
    </div>
  )
}
