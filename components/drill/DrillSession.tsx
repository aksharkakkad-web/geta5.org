'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { Check, X, Settings } from 'lucide-react'
import DrillCard from '@/components/drill/DrillCard'
import MatchingCard from '@/components/drill/MatchingCard'
import { SessionState, saveDrillDraft, clearDrillDraft, insertRetryCard, matchesFilter } from '@/utils/drillSession'
import type { DrillFilter } from '@/utils/drillSession'
import { getSubject } from '@/utils/subjects'
import { scramble } from '@/utils/scramble'
import { lsGet, lsSet, LS_KEYS } from '@/utils/localStorage'
import { logEvent } from '@/utils/analytics'
import { shouldBlockAccess } from '@/utils/freeTrialGate'
import { useAuth } from '@/contexts/AuthContext'
import {
  loadDrillStyles,
  saveDrillStyles,
  atLeastOneEnabled,
  computeStylePlan,
  type DrillStyleSettings,
  type MatchingGroup,
  type StylePlan,
} from '@/utils/drillStyles'

interface DrillSessionProps {
  session: SessionState
  subject: string
  onComplete: (finalSession: SessionState) => void
  onStartFresh?: () => void
}

export default function DrillSession({ session, subject, onComplete, onStartFresh }: DrillSessionProps) {
  const { isAuthenticated } = useAuth()
  const pathname = usePathname()
  const [currentIndex, setCurrentIndex] = useState(session.index ?? 0)
  const [answers, setAnswers] = useState<
    Record<string, { verdict: 'correct' | 'wrong'; userInput: string }>
  >(session.answers ?? {})
  const [gateBlocked, setGateBlocked] = useState(false)

  const answersRef = useRef(answers)
  answersRef.current = answers

  const currentIndexRef = useRef(currentIndex)
  currentIndexRef.current = currentIndex

  const [filterMode, setFilterMode] = useState<DrillFilter>('all')

  // Style plan must be computed before workingDeck so the reorderedDeck is available
  // for the fresh-session initializer below.
  const [styles, setStyles] = useState<DrillStyleSettings>(() => loadDrillStyles())
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [blockedMsg, setBlockedMsg] = useState(false)
  const stylePlanRef = useRef<StylePlan>(
    computeStylePlan(session.workingDeck ?? [...session.cards], loadDrillStyles())
  )

  // Resumed drafts keep their saved working deck; fresh sessions use the style plan's
  // reordered deck so matching rounds are spread out and contain topically similar cards.
  const [workingDeck, setWorkingDeck] = useState<SessionState['cards']>(() =>
    session.workingDeck ?? stylePlanRef.current.reorderedDeck
  )
  const workingDeckRef = useRef(workingDeck)
  workingDeckRef.current = workingDeck

  const handleFilterChange = (newFilter: DrillFilter) => {
    if (newFilter === filterMode) return
    const currentCard = workingDeckRef.current[currentIndexRef.current]
    const answeredIds = new Set(Object.keys(answersRef.current))
    const unanswered = session.cards.filter(c =>
      !answeredIds.has(c.id) && c.id !== currentCard.id && matchesFilter(c, newFilter)
    )
    const wrong = session.cards.filter(c =>
      answersRef.current[c.id]?.verdict === 'wrong' && matchesFilter(c, newFilter)
    )
    const newRemaining = scramble([...unanswered, ...wrong])
    setWorkingDeck([...workingDeckRef.current.slice(0, currentIndexRef.current + 1), ...newRemaining])
    setFilterMode(newFilter)
  }

  // Style toggle handler
  function toggleStyle(key: keyof DrillStyleSettings) {
    setStyles(prev => {
      const next = { ...prev, [key]: !prev[key] }
      if (!atLeastOneEnabled(next)) {
        setBlockedMsg(true)
        setTimeout(() => setBlockedMsg(false), 2200)
        return prev
      }
      saveDrillStyles(next)
      return next
    })
  }

  // Auto-save draft on index advance
  useEffect(() => {
    if (currentIndex > 0) {
      saveDrillDraft(subject, {
        cards: session.cards,
        workingDeck: workingDeckRef.current,
        currentIndex,
        answers: answersRef.current,
        isRetry: session.isRetry,
        unitSlug: session.unitSlug,
        savedAt: Date.now(),
      })
      if (!session.isRetry && session.unitSlug !== 'all') {
        const ans = answersRef.current
        const answered = Object.keys(ans).length
        if (answered > 0) {
          const correct = Object.values(ans).filter(a => a.verdict === 'correct').length
          const existing = lsGet(LS_KEYS.mastery(subject, session.unitSlug), { drillAccuracy: 0, mcqAccuracy: 0, totalAttempts: 0 })
          lsSet(LS_KEYS.mastery(subject, session.unitSlug), { ...existing, drillAccuracy: correct / answered })
        }
      }
    }
  }, [currentIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  const totalCards = workingDeck.length
  const currentCard = workingDeck[currentIndex]

  const correctCount = Object.values(answers).filter(a => a.verdict === 'correct').length
  const wrongCount = Object.values(answers).filter(a => a.verdict === 'wrong').length

  const subjectData = getSubject(subject)
  let unitLabel: string
  if (session.unitSlug === 'all') {
    unitLabel = 'All Units'
  } else {
    const unitNumber = session.unitSlug.replace('unit-', '')
    const unitData = subjectData?.units.find(u => u.number === parseInt(unitNumber, 10))
    unitLabel = unitData ? `Unit ${unitNumber} · ${unitData.name}` : `Unit ${unitNumber}`
  }
  if (session.isRetry) unitLabel = `Retry · ${unitLabel}`

  const handleAnswer = (
    cardId: string,
    verdict: 'correct' | 'wrong',
    userInput: string
  ) => {
    setAnswers(prev => ({ ...prev, [cardId]: { verdict, userInput } }))
    const card = workingDeckRef.current[currentIndexRef.current]
    logEvent({
      event_type: 'drill_answer',
      subject,
      unit: card?.unit ?? session.unitSlug,
      metadata: { correct: verdict === 'correct', mode: card?.mode },
    })
  }

  const handleNext = () => {
    const cardBeingAnswered = workingDeckRef.current[currentIndexRef.current]
    const finalVerdict = answersRef.current[cardBeingAnswered.id]?.verdict

    lsSet(LS_KEYS.totalQuestions, lsGet<number>(LS_KEYS.totalQuestions, 0) + 1)
    lsSet(LS_KEYS.drillCount, lsGet<number>(LS_KEYS.drillCount, 0) + 1)
    if (finalVerdict === 'correct') lsSet(LS_KEYS.drillCorrect, lsGet<number>(LS_KEYS.drillCorrect, 0) + 1)

    if (!isAuthenticated && shouldBlockAccess()) {
      setGateBlocked(true)
      return
    }

    let nextDeck = workingDeckRef.current
    if (finalVerdict === 'wrong') {
      nextDeck = insertRetryCard(workingDeckRef.current, cardBeingAnswered, currentIndexRef.current)
      setWorkingDeck(nextDeck)
    }

    if (currentIndexRef.current + 1 >= nextDeck.length) {
      clearDrillDraft(subject)
      onComplete({ ...session, index: currentIndexRef.current + 1, answers: { ...answersRef.current } })
    } else {
      setCurrentIndex(prev => prev + 1)
    }
  }

  // Matching group completion handler
  const handleMatchingDone = useCallback((group: MatchingGroup, verdicts: Record<string, 'correct' | 'wrong'>) => {
    const idx = currentIndexRef.current
    const groupSize = group.cards.length

    // Record answers
    const newAnswers = {
      ...answersRef.current,
      ...Object.fromEntries(Object.entries(verdicts).map(([id, v]) => [id, { verdict: v, userInput: '' }])),
    }
    setAnswers(newAnswers)
    answersRef.current = newAnswers

    // Log + counters
    for (const c of group.cards) {
      logEvent({ event_type: 'drill_answer', subject, unit: c.unit, metadata: { correct: verdicts[c.id] === 'correct', mode: 'matching' } })
    }
    lsSet(LS_KEYS.totalQuestions, lsGet<number>(LS_KEYS.totalQuestions, 0) + groupSize)
    lsSet(LS_KEYS.drillCount, lsGet<number>(LS_KEYS.drillCount, 0) + groupSize)
    const correct = Object.values(verdicts).filter(v => v === 'correct').length
    lsSet(LS_KEYS.drillCorrect, lsGet<number>(LS_KEYS.drillCorrect, 0) + correct)

    if (!isAuthenticated && shouldBlockAccess()) { setGateBlocked(true); return }

    // Insert retries for wrong cards (after the full group span)
    let nextDeck = workingDeckRef.current
    const lastMemberIdx = idx + groupSize - 1
    for (const wrongCard of group.cards.filter(c => verdicts[c.id] === 'wrong')) {
      nextDeck = insertRetryCard(nextDeck, wrongCard, lastMemberIdx)
    }
    if (nextDeck !== workingDeckRef.current) {
      workingDeckRef.current = nextDeck
      setWorkingDeck(nextDeck)
    }

    const nextIndex = idx + groupSize
    if (nextIndex >= nextDeck.length) {
      clearDrillDraft(subject)
      onComplete({ ...session, index: nextIndex, answers: newAnswers })
    } else {
      setCurrentIndex(nextIndex)
    }
  }, [isAuthenticated, subject, session, onComplete]) // eslint-disable-line react-hooks/exhaustive-deps

  // Determine what to render for the current slot
  const stylePlan = stylePlanRef.current
  const matchingGroup = stylePlan.matchingAnchorMap.get(currentCard?.id ?? '')
  // Only show matching if none of the group's cards have been answered yet (handles retry card edge case)
  const groupConsumed = matchingGroup && matchingGroup.cards.some(c => answersRef.current[c.id])
  const activeMatchingGroup = matchingGroup && !groupConsumed ? matchingGroup : undefined
  const isOrphanMember = !activeMatchingGroup && stylePlan.groupMemberIds.has(currentCard?.id ?? '')
  const presentStyle = activeMatchingGroup
    ? undefined
    : isOrphanMember
    ? 'typed' as const
    : (stylePlan.styleMap[currentCard?.id ?? ''] ?? 'typed')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100dvh - 120px)', position: 'relative' }}>

      {/* Freemium gate overlay */}
      {gateBlocked && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'var(--bg-overlay)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-lg)', padding: '40px 32px', maxWidth: '420px', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div aria-hidden="true" style={{ width: '52px', height: '52px', borderRadius: '10px', transform: 'rotate(45deg)', background: 'linear-gradient(135deg, var(--accent), #a78bfa)', boxShadow: '0 0 24px color-mix(in srgb, var(--accent) 40%, transparent)', flexShrink: 0 }} />
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, marginBottom: '10px', fontFamily: 'var(--font-outfit)', lineHeight: 1.3 }}>
                You&apos;ve used your 3 free questions
              </h2>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                Sign up for free to keep practicing — unlimited drills, practice questions, and more.
              </p>
            </div>
            <a href={`/signup?redirect=${encodeURIComponent(pathname)}`} style={{ marginTop: '8px', display: 'block', width: '100%', padding: '13px 0', borderRadius: 'var(--radius-md)', background: 'var(--accent)', color: 'white', fontSize: '1rem', fontWeight: 700, textDecoration: 'none', textAlign: 'center', fontFamily: 'var(--font-outfit)' }}>
              Sign Up Free
            </a>
          </div>
        </div>
      )}

      {/* Session header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-secondary)', flexShrink: 0 }}>
          {unitLabel}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '999px', background: 'color-mix(in srgb, var(--accent-success) 15%, transparent)', border: '1px solid color-mix(in srgb, var(--accent-success) 30%, transparent)', color: 'var(--accent-success)', fontSize: '0.8125rem', fontWeight: 600 }}>
              <Check size={12} /><span>{correctCount}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '999px', background: 'color-mix(in srgb, var(--accent-danger) 15%, transparent)', border: '1px solid color-mix(in srgb, var(--accent-danger) 30%, transparent)', color: 'var(--accent-danger)', fontSize: '0.8125rem', fontWeight: 600 }}>
              <X size={12} /><span>{wrongCount}</span>
            </div>
          </div>

          {/* Settings gear */}
          <button
            onClick={() => setSettingsOpen(o => !o)}
            title="Question style settings"
            style={{
              flexShrink: 0, width: '30px', height: '30px', borderRadius: '8px',
              border: `1px solid ${settingsOpen ? 'var(--accent)' : 'var(--bg-border)'}`,
              background: settingsOpen ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'transparent',
              color: settingsOpen ? 'var(--accent)' : 'var(--text-muted)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'border-color 150ms ease, color 150ms ease, background 150ms ease',
            }}
          >
            <Settings size={14} />
          </button>

          {onStartFresh && (
            <button onClick={onStartFresh} style={{ flexShrink: 0, padding: '4px 12px', borderRadius: '999px', border: '1px solid var(--bg-border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer' }}>
              Start fresh
            </button>
          )}
        </div>
      </div>

      {/* Settings panel */}
      {settingsOpen && (
        <div style={{ marginTop: '10px', background: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-md)', padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Question Styles</span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Takes effect next session</span>
          </div>

          {([
            { key: 'typed_recall' as const,  label: 'Typed Recall',   desc: 'Type the answer from memory' },
            { key: 'tap_to_select' as const, label: 'Tap to Select',  desc: 'Pick from 4 answer tiles' },
            { key: 'matching' as const,      label: 'Matching Round', desc: 'Connect terms to definitions' },
          ]).map(({ key, label, desc }) => {
            const isOn = styles[key]
            const isLast = isOn && Object.values(styles).filter(Boolean).length === 1
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--bg-secondary)' }}>
                <div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{desc}</div>
                </div>
                <button
                  onClick={() => toggleStyle(key)}
                  title={isLast ? 'At least one style must be enabled' : undefined}
                  style={{
                    width: '40px', height: '22px', borderRadius: '999px', border: 'none',
                    background: isOn ? 'var(--accent)' : 'var(--bg-border)',
                    cursor: isLast ? 'not-allowed' : 'pointer',
                    position: 'relative', transition: 'background 200ms ease', flexShrink: 0,
                    opacity: isLast ? 0.5 : 1,
                  }}
                >
                  <span style={{
                    position: 'absolute', top: '3px', left: '3px',
                    width: '16px', height: '16px', borderRadius: '50%', background: 'white',
                    transition: 'transform 200ms ease',
                    transform: isOn ? 'translateX(18px)' : 'translateX(0)',
                    display: 'block',
                  }} />
                </button>
              </div>
            )
          })}

          {blockedMsg && (
            <div style={{ marginTop: '10px', fontSize: '0.8125rem', color: 'var(--accent-warning)', fontWeight: 500 }}>
              At least one style must stay enabled.
            </div>
          )}
        </div>
      )}

      {/* Filter toggle */}
      <div style={{ marginTop: '12px' }}>
        <div style={{ display: 'inline-flex', background: 'var(--bg-card)', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-md)', padding: '3px' }}>
          {(['all', 'vocab', 'concept'] as DrillFilter[]).map((f) => {
            const labels: Record<DrillFilter, string> = { all: 'All', vocab: 'Vocab', concept: 'Concept' }
            const active = filterMode === f
            return (
              <button key={f} onClick={() => handleFilterChange(f)} style={{ padding: '5px 14px', borderRadius: '5px', border: 'none', background: active ? 'var(--accent)' : 'transparent', color: active ? 'white' : 'var(--text-muted)', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', transition: 'background 150ms ease, color 150ms ease' }}>
                {labels[f]}
              </button>
            )
          })}
        </div>
      </div>

      {/* Card area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '24px', paddingBottom: '24px' }}>
        {activeMatchingGroup ? (
          <MatchingCard
            key={`matching-${activeMatchingGroup.anchorId}-${currentIndex}`}
            cards={activeMatchingGroup.cards}
            onComplete={(verdicts) => handleMatchingDone(activeMatchingGroup, verdicts)}
          />
        ) : (
          <DrillCard
            key={`${currentCard.id}-${currentIndex}`}
            card={currentCard}
            onAnswer={handleAnswer}
            onNext={handleNext}
            isRetry={!!answers[currentCard.id]}
            presentStyle={presentStyle as any}
            sessionCards={session.cards}
          />
        )}
      </div>
    </div>
  )
}
