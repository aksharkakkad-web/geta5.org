// utils/freeTrialGate.ts
import { lsGet, LS_KEYS } from '@/utils/localStorage'

export const FREE_QUESTION_LIMIT = 3

export function shouldBlockAccess(): boolean {
  const total = lsGet<number>(LS_KEYS.totalQuestions, 0)
  return total >= FREE_QUESTION_LIMIT
}
