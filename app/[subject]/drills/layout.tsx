import type { Metadata } from 'next'
import { getSubject } from '@/utils/subjects'

interface Props {
  params: Promise<{ subject: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject: slug } = await params
  const subject = getSubject(slug)
  if (!subject) return {}
  return {
    title: `${subject.name} Drills — Free Practice | geta5.org`,
    description: `Practice ${subject.name} vocabulary, formulas, and key terms with free flashcard-style drills. No signup required.`,
  }
}

export default function DrillsLayout({ children }: Props) {
  return children
}
