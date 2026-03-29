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
    title: `${subject.name} Practice Questions — Free MCQs | geta5.org`,
    description: `Free ${subject.name} multiple-choice practice questions with detailed explanations. AP exam format. No signup required.`,
  }
}

export default function PracticeLayout({ children }: Props) {
  return children
}
