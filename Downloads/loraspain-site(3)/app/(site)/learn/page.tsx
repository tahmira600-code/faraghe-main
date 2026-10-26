import CoursePath from '@/components/CoursePath';
import { getViewer } from '@/lib/access';
import { UNITS } from '@/lib/course';
import { loadProgress } from '@/lib/progress';

export const metadata = { title: 'برنامج التعلم خطوة بخطوة', description: 'دروس الإسبانية بالعربية من الصفر: شرح، كلمات، حوار، واختبار في كل درس.', alternates: { canonical: '/learn' } };

export default async function Learn() {
  const viewer = await getViewer();
  const progress = await loadProgress(viewer.user?.id);
  const done = progress.filter((r) => r.topic_id === 'course').flatMap((r) => r.known);
  const units = UNITS.map((u) => ({
    unit: u.unit, level: u.level, title_ar: u.title_ar, title_es: u.title_es, emoji: u.emoji, open: true,
    lessons: u.lessons.map((l) => ({ id: l.id, title_ar: l.title_ar, title_es: l.title_es, emoji: l.emoji })),
  }));
  return (<>
    <div className="hd"><div><h1>برنامج التعلم 🎯</h1><p>درس بعد درس، من الصفر حتى تتكلم في العمل والإدارة. كل درس: شرح، كلمات، حوار، واختبار.</p></div></div>
    {units.length ? <CoursePath units={units} serverDone={done} signedIn={!!viewer.user} /> : <div className="empty">نحضّر الدروس الآن.</div>}
  </>);
}
