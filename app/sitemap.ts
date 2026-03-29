import type { MetadataRoute } from 'next'
import { getAllSubjects } from '@/utils/subjects'

export default function sitemap(): MetadataRoute.Sitemap {
  const subjects = getAllSubjects()
  const baseUrl = 'https://geta5.org'

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
  ]

  const subjectPages: MetadataRoute.Sitemap = subjects.flatMap(s => [
    { url: `${baseUrl}/${s.slug}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/${s.slug}/drills`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/${s.slug}/practice`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/${s.slug}/study-guide`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  ])

  return [...staticPages, ...subjectPages]
}
