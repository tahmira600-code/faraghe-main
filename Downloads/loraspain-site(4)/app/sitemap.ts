import type { MetadataRoute } from 'next';
import { ALL_LESSONS } from '@/lib/course';
import { loadSite } from '@/lib/data';
import { SITE_URL } from '@/lib/site';

// خريطة الموقع لـ Google Search Console: كل الصفحات العامة، وكل موضوع ومهنة ودرس
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { topics } = await loadSite();
  const now = new Date();
  const page = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({ url: SITE_URL + path, lastModified: now, changeFrequency: 'weekly', priority });
  return [
    page('/', 1),
    page('/learn', 0.9),
    page('/dictionary', 0.8),
    page('/jobs', 0.8),
    page('/quiz', 0.6),
    page('/privacy', 0.2),
    ...topics.filter((t) => t.published).map((t) => page(`/topic/${t.id}`, 0.7)),
    ...ALL_LESSONS.map((l) => page(`/learn/${l.id}`, 0.6)),
  ];
}
