import Link from 'next/link';
import Quiz from '@/components/Quiz';
import { canOpen, getViewer } from '@/lib/access';
import { loadProgress } from '@/lib/progress';
import { currentLang, loadCards, loadSite, tr } from '@/lib/data';
import { LEVELS, parseLevel, type Level } from '@/lib/types';

export const metadata = { title: 'اختبار المستوى', alternates: { canonical: '/quiz' } };

export default async function LevelQuiz({ searchParams }: { searchParams: Promise<{ level?: string }> }) {
  const level = parseLevel((await searchParams).level);
  const [{ topics, languages, settings }, viewer] = await Promise.all([loadSite(), getViewer()]);
  const lang = await currentLang(languages);
  // الأسئلة من المواضيع المفتوحة لهذا المستخدم فقط
  const ids = topics.filter((t) => t.published && t.kind !== 'package' && canOpen(t, viewer)).map((t) => t.id);
  const pool = (await loadCards(ids)).filter((c) => c.level === level)
    .map((c) => ({ es: c.es, t: tr(c.tr, lang.code), emoji: c.emoji, audio: c.audio_url ?? null }));
  const best = (await loadProgress(viewer.user?.id)).find((r) => r.topic_id === '_level' && r.level === level);
  return (<>
    <div className="hd">
      <div><h1>اختبار المستوى {LEVELS[level].name} 🏆</h1><p>10 أسئلة: ما معنى الكلمة، اسمع واختر، وكيف تقولها بالإسبانية.</p></div>
      <nav className="seg">{([1, 2, 3] as Level[]).map((l) => <Link key={l} href={`/quiz?level=${l}`} aria-current={l === level}>{LEVELS[l].name}</Link>)}</nav>
    </div>
    {!viewer.user && <div className="banner">الاختبار الآن على المواضيع المجانية فقط. سجّل الدخول لتدخل فيه مواضيع أكثر.</div>}
    {pool.length < 4 && <div className="banner">لا توجد كلمات كافية في هذا المستوى بعد. <Link href="/learn">ابدأ برنامج التعلم</Link></div>}
    <Quiz key={level} save={viewer.user ? { topic: '_level', level } : undefined} best={best?.quiz_best != null && best.quiz_total ? { score: best.quiz_best, total: best.quiz_total } : null} sound={settings.sound_enabled !== '0'} title={`اختبار المستوى ${LEVELS[level].name}`} pool={pool} after={level < 3 ? { href: `/?level=${level + 1}`, label: 'المستوى التالي' } : undefined} />
  </>);
}
