import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import fs from 'fs'
import path from 'path'
import { getSubject } from '@/utils/subjects'
import { hasCountriesHub, type CountriesData } from '@/utils/countries'
import { BackToSubject } from '@/components/ui/BackToSubject'
import { CountriesHubClient } from '@/components/countries/CountriesHubClient'
import { AuthGuard } from '@/components/auth/AuthGuard'

interface PageProps {
  params: Promise<{ subject: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { subject: slug } = await params
  const subject = getSubject(slug)
  if (!subject || !hasCountriesHub(slug)) return {}
  return {
    title: `Required Countries — ${subject.name} | geta5.app`,
    description: `Comparative country profiles for all 6 AP Comparative Government and Politics course countries: UK, Russia, China, Iran, Mexico, and Nigeria.`,
  }
}

function loadData(subject: string): CountriesData | null {
  try {
    const file = path.join(process.cwd(), 'public', 'data', subject, 'countries.json')
    const raw = fs.readFileSync(file, 'utf-8')
    return JSON.parse(raw) as CountriesData
  } catch {
    return null
  }
}

export default async function CountriesHubPage({ params }: PageProps) {
  const { subject: slug } = await params
  const subject = getSubject(slug)
  if (!subject || !hasCountriesHub(slug)) notFound()

  const data = loadData(slug)

  return (
    <AuthGuard requireAuth>
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
          Required Countries
        </h1>
        <p style={{
          fontSize: '0.9375rem',
          color: 'var(--text-secondary)',
          margin: '0 0 32px 0',
          maxWidth: '70ch',
        }}>
          {data && data.items.length > 0
            ? `Comparative profiles for all ${data.items.length} course countries — they appear on FRQs and MCQs every year. Each profile covers government structure, electoral system, party system, civil society, and political economy.`
            : 'Country profiles for AP Comparative Government and Politics. Check back soon — content is being added.'}
        </p>

        {data && data.items.length > 0 ? (
          <CountriesHubClient items={data.items} subject={slug} />
        ) : (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--bg-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '48px 32px',
            textAlign: 'center',
          }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', margin: 0 }}>
              Country profiles are coming soon.
            </p>
          </div>
        )}
      </div>
    </AuthGuard>
  )
}
