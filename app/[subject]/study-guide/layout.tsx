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
    title: `${subject.name} Study Guide — Free Review | geta5.org`,
    description: `Free ${subject.name} study guide with core concepts, key terms, formulas, and exam tips. No signup required.`,
  }
}

export default function StudyGuideLayout({ children }: Props) {
  return children
}
