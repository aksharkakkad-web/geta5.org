'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { X } from 'lucide-react'
import { lsGet, lsSet } from '@/utils/localStorage'
import { findUnseen, type ChangelogEntry as Entry } from '@/utils/changelog'
import { ChangelogEntry } from './ChangelogEntry'

const STORAGE_KEY = 'ascendly_last_seen_changelog'

export function ChangelogModal() {
  const [unseen, setUnseen] = useState<Entry[] | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/data/changelog.json', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Entry[] | null) => {
        if (cancelled || !Array.isArray(data) || data.length === 0) return
        const stored = lsGet<string>(STORAGE_KEY, '')
        const result = findUnseen(data, stored || null)
        if (result === null) {
          // First-visit signal: silently mark latest as seen, render nothing.
          lsSet(STORAGE_KEY, data[0].id)
          return
        }
        if (result.length > 0) setUnseen(result)
      })
      .catch(() => {
        // Network error or invalid JSON — fail silently
      })
    return () => {
      cancelled = true
    }
  }, [])

  const close = useCallback(() => {
    if (unseen && unseen.length > 0) {
      lsSet(STORAGE_KEY, unseen[0].id)
    }
    setUnseen(null)
  }, [unseen])

  // Lock body scroll while open
  useEffect(() => {
    if (!unseen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [unseen])

  // Escape key closes
  useEffect(() => {
    if (!unseen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [unseen, close])

  if (!unseen || unseen.length === 0) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="changelog-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        animation: 'changelog-fade 200ms ease-out',
      }}
      onClick={(e) => {
        // Backdrop click does NOT close; absorb to prevent bubbling
        e.stopPropagation()
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--bg-border)',
          borderRadius: 'var(--radius-lg)',
          maxWidth: 480,
          width: '100%',
          maxHeight: 'calc(100vh - 64px)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
          animation: 'changelog-scale 200ms ease-out',
        }}
      >
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--bg-border)',
          }}
        >
          <h2 id="changelog-title" style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            What&apos;s new
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close changelog"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </header>

        <div style={{ padding: '0 20px', overflowY: 'auto', flex: 1 }}>
          {unseen.map((entry, i) => (
            <div
              key={entry.id}
              style={{ borderBottom: i < unseen.length - 1 ? '1px solid var(--bg-border)' : 'none' }}
            >
              <ChangelogEntry entry={entry} />
            </div>
          ))}
        </div>

        <footer style={{ padding: '12px 20px 16px', borderTop: '1px solid var(--bg-border)' }}>
          <button
            type="button"
            onClick={close}
            style={{
              width: '100%',
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              fontSize: '0.9375rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Got it
          </button>
        </footer>
      </div>
    </div>
  )
}
