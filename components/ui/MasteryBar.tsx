interface MasteryBarProps {
  value: number  // 0–100
}

export function MasteryBar({ value }: MasteryBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value))

  return (
    <div
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{
        backgroundColor: 'var(--mastery-empty)',
        borderRadius: '999px',
        height: '6px',
        overflow: 'hidden',
      }}
    >
      <div
        className="mastery-fill"
        style={{
          backgroundColor: 'var(--mastery-fill)',
          borderRadius: '999px',
          height: '100%',
          width: `${clampedValue}%`,
          transition: 'width 400ms ease',
        }}
      />
    </div>
  )
}
