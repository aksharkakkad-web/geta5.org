let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

export function playCorrect(): void {
  if (typeof window === 'undefined') return
  const ac = getCtx()

  // Soft major third chord: C5 (523Hz) + E5 (659Hz)
  const freqs = [523.25, 659.25]
  freqs.forEach(freq => {
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.connect(gain)
    gain.connect(ac.destination)
    osc.type = 'sine'
    osc.frequency.value = freq
    const now = ac.currentTime
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.12, now + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32)
    osc.start(now)
    osc.stop(now + 0.32)
  })
}

export function playWrong(): void {
  if (typeof window === 'undefined') return
  const ac = getCtx()

  // Low, round tone: B3 (247Hz) — subtle thud
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.connect(gain)
  gain.connect(ac.destination)
  osc.type = 'sine'
  osc.frequency.value = 247.0
  const now = ac.currentTime
  gain.gain.setValueAtTime(0.08, now)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25)
  osc.start(now)
  osc.stop(now + 0.25)
}
