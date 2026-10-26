import Link from 'next/link';
import { notFound } from 'next/navigation';
import LessonPlayer from '@/components/LessonPlayer';
import { getViewer } from '@/lib/access';
import { findLesson } from '@/lib/course';
import { loadSite } from '@/lib/data';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const found = findLesson((await params).id);
  if (!found) return {};
  const { lesson } = found;
  return { title: `${lesson.title_ar} (${lesson.title_es})`, description: lesson.goal_ar, alternates: { canonical: `/learn/${lesson.id}` } };
}

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const found = findLesson(id);
  if (!found) notFound();
  const [{ settings }, viewer] = await Promise.all([loadSite(), getViewer()]);
  const { lesson, next, index } = found;
  return (<>
    <div className="crumb"><Link href="/learn">← برنامج التعلم</Link><span>الوحدة {lesson.unit} · الدرس {index + 1}</span></div>
    <LessonPlayer lesson={lesson} next={next ? { id: next.id, title: next.title_ar } : null} signedIn={!!viewer.user} sound={settings.sound_enabled !== '0'} />
  </>);
}
