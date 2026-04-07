// utils/testConfig.ts
// AP exam configuration constants — question counts and durations from College Board
// Verified: D-04, D-13 (AP-accurate data from research phase)

export interface TestConfig {
  questionCount: number
  durationMinutes: number
  frqDurationMinutes?: number  // Section II timing (undefined = no FRQ section)
  frqCount?: number            // Number of FRQs in Section II
}

export const AP_TEST_CONFIG: Record<string, TestConfig> = {
  'ap-psychology':    { questionCount: 75,  durationMinutes: 90,  frqDurationMinutes: 100, frqCount: 2 },
  'ap-world-history': { questionCount: 55,  durationMinutes: 55,  frqDurationMinutes: 100, frqCount: 4 },
  'ap-government':    { questionCount: 55,  durationMinutes: 80,  frqDurationMinutes: 100, frqCount: 4 },
  'ap-calculus-ab':   { questionCount: 45,  durationMinutes: 105, frqDurationMinutes: 90,  frqCount: 6 },
  'ap-precalculus':   { questionCount: 40,  durationMinutes: 120, frqDurationMinutes: 60,  frqCount: 4 },
  'ap-csp':           { questionCount: 70,  durationMinutes: 120 },
  'ap-chemistry':     { questionCount: 60,  durationMinutes: 90,  frqDurationMinutes: 105, frqCount: 7 },
}
