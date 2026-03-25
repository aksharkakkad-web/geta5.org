// utils/testConfig.ts
// AP exam configuration constants — question counts and durations from College Board
// Verified: D-04, D-13 (AP-accurate data from research phase)

export interface TestConfig {
  questionCount: number
  durationMinutes: number
}

export const AP_TEST_CONFIG: Record<string, TestConfig> = {
  'ap-psychology':    { questionCount: 75,  durationMinutes: 90  },
  'ap-world-history': { questionCount: 55,  durationMinutes: 55  },
  'ap-government':    { questionCount: 55,  durationMinutes: 80  },
  'ap-calculus-ab':   { questionCount: 45,  durationMinutes: 105 },
  'ap-precalculus':   { questionCount: 40,  durationMinutes: 120 },
  'ap-csp':           { questionCount: 70,  durationMinutes: 120 },
  'ap-chemistry':     { questionCount: 60,  durationMinutes: 90  },
}
