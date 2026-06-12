import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Founders — geta5.app',
  description: 'Meet the founders of geta5.app',
}

function FounderCard({
  photo,
  name,
  subtitle,
  heading,
  accentLine,
  paragraphs,
  email,
}: {
  photo: string
  name: string
  subtitle: string
  heading: string
  accentLine: string
  paragraphs: string[]
  email: string
}) {
  return (
    <div className="founder-card" style={{
      width: '100%',
      background: 'var(--bg-card)',
      border: '1px solid var(--bg-border)',
      borderRadius: '24px',
      padding: '48px',
      display: 'flex',
      gap: '48px',
      alignItems: 'flex-start',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Gradient border top */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.5), rgba(167, 139, 250, 0.5), transparent)',
      }} />

      {/* Photo column */}
      <div className="founder-photo-col" style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.3), 0 0 32px rgba(99, 102, 241, 0.15)',
        }}>
          <Image
            src={photo}
            alt={name}
            fill
            style={{ objectFit: 'cover', objectPosition: 'center top' }}
            priority
          />
        </div>

        {/* Name + title under photo */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            {name}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {subtitle}
          </div>
        </div>
      </div>

      {/* Bio column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '4px' }}>
        <div>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            margin: 0,
          }}>
            {heading}
          </h2>
          <p style={{
            fontSize: '1.125rem',
            color: 'var(--accent-hover)',
            fontWeight: 500,
            marginTop: '6px',
          }}>
            {accentLine}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {paragraphs.map((text, i) => (
            <p key={i} style={{
              fontSize: '1rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              margin: 0,
            }}>
              {text}
            </p>
          ))}
          <p style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            margin: 0,
          }}>
            Feel free to reach out:{' '}
            <a
              href={`mailto:${email}`}
              style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 500 }}
            >
              {email}
            </a>
          </p>
        </div>

        {/* Stats row */}
        <div className="founder-stats" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginTop: '8px',
        }}>
          {[
            { value: '7', label: 'AP Subjects' },
            { value: '1,000+', label: 'Practice Questions' },
            { value: '100%', label: 'Free to Use' },
          ].map(stat => (
            <div key={stat.label} style={{
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--bg-border)',
              borderRadius: '12px',
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
              }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function FounderPage() {
  return (
    <>
    <style>{`
      @media (max-width: 640px) {
        .founder-card { flex-direction: column !important; align-items: center !important; padding: 32px 24px !important; }
        .founder-stats { grid-template-columns: repeat(3, 1fr) !important; }
        .founder-photo-col { align-items: center !important; }
      }
    `}</style>
    <div style={{
      minHeight: 'calc(100dvh - 56px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '64px 24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient glow blobs */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '15%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '15%',
        right: '10%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(167, 139, 250, 0.06) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: '860px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '48px',
      }}>
        {/* Tag */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: '100px',
        }}>
          <span style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a78bfa', fontWeight: 600 }}>
            Founder &amp; Creator
          </span>
        </div>

        {/* Akshar — Founder */}
        <FounderCard
          photo="/founder.png"
          name="Akshar"
          subtitle="Builder · Student · Creator"
          heading="Hey, I'm Akshar."
          accentLine="I built geta5.app because every student deserves a fair shot."
          paragraphs={[
            "I'm a student passionate about artificial intelligence and machine learning. When I looked at the AP prep landscape, I saw the same thing over and over: the best resources locked behind expensive subscriptions, leaving students who couldn't pay at a disadvantage. That felt wrong to me.",
            "So I built geta5.app. Using AI to generate high-quality practice questions, instant feedback, and adaptive drills across 7 AP subjects, all completely free. My goal is simple: level the playing field so that any student, anywhere, has the tools to walk into exam day confident.",
            "I'm constantly working to make this better. If you have feedback, ideas, or just want to say hi, I'd love to hear from you.",
          ]}
          email="aksharkakkad@gmail.com"
        />
      </div>
    </div>
    </>
  )
}
