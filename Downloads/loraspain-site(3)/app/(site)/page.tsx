import Link from 'next/link';
import Emo from '@/components/Emo';
import Speak from '@/components/Speak';
import { canOpen, getViewer, isSoon } from '@/lib/access';
import { currentLang, loadCards, loadSite, tr } from '@/lib/data';
import { knownFor, loadProgress } from '@/lib/progress';
import { LEVELS, parseLevel, type Level } from '@/lib/types';

const TIER_NOTE = { free: 'مجاني', account: 'مجاني بحساب Google', paid: 'مجاني بحساب Google' } as const;

export const metadata = { alternates: { canonical: '/' } };

export default async function Home({ searchParams }: { searchParams: Promise<{ level?: string }> }) {
  const level = parseLevel((await searchParams).level);
  const [{ topics, languages, settings }, viewer, cards] = await Promise.all([loadSite(), getViewer(), loadCards()]);
  const [lang, progress] = await Promise.all([currentLang(languages), loadProgress(viewer.user?.id)]);
  const shown = topics.filter((t) => t.published && t.kind === 'topic');
  const packages = topics.filter((t) => t.published && t.kind === 'package');
  const jobs = topics.filter((t) => t.published && t.kind === 'job');
  const free = topics.filter((t) => t.published && t.tier === 'free').map((t) => t.id);
  const inLevel = (id: string) => cards.filter((c) => c.topic_id === id && c.level === level);
  // كلمة اليوم: تتغير كل يوم، من البطاقات المجانية للمبتدئ
  const freeCards = cards.filter((c) => free.includes(c.topic_id) && c.level === 1);
  const wod = freeCards.length ? freeCards[Math.floor(Date.now() / 864e5) % freeCards.length] : null;
  const wodTopic = wod && topics.find((t) => t.id === wod.topic_id);
  const first = viewer.user?.name.split(' ')[0];
  const learned = progress.reduce((n, r) => n + (r.level > 0 ? r.known.length : 0), 0);
  const quizzes = progress.filter((r) => r.quiz_best != null).length;

  const tile = (t: (typeof topics)[number]) => {
    const open = canOpen(t, viewer);
    const list = inLevel(t.id);
    const known = knownFor(progress, t.id);
    const done = list.filter((c) => known.has(c.id)).length;
    if (isSoon(t, settings)) return (
      <Link key={t.id} href={`/topic/${t.id}`} className={`tile soon ${t.color}`}>
        <span className="lk">⏳ قريبا</span>
        <span className="e"><Emo e={t.emoji} size={56} /></span>
        <b>{t.name}</b>
        <small>نحضّر محتواه من المصدر الرسمي</small>
      </Link>
    );
    return (
      <Link key={t.id} href={`/topic/${t.id}?level=${level}`} className={`tile ${t.color}`}>
        {!open && <span className="lk">🔒</span>}
        <span className="e"><Emo e={t.emoji} size={56} /></span>
        <b>{t.name}</b>
        <small>{TIER_NOTE[t.tier]} · {list.length} كلمة</small>
        {viewer.user && list.length > 0 && <span className="pbar" aria-label={`تعلمت ${done} من ${list.length}`}><i style={{ width: `${Math.round((done / list.length) * 100)}%` }} /></span>}
      </Link>
    );
  };

  return (<>
    <div className="hero">
      <div className="m">
        <h1>{first ? `أهلا ${first} 👋` : settings.hero_title}</h1>
        <p>{first ? 'ماذا ستتعلم اليوم؟' : settings.hero_subtitle}</p>
        <nav className="seg" aria-label="المستوى">
          {([1, 2, 3] as Level[]).map((l) => <Link key={l} href={`/?level=${l}`} aria-current={l === level}>{LEVELS[l].name}</Link>)}
        </nav>
      </div>
      <div className="art" aria-hidden="true"><Emo e="📚" size={84} /><Emo e="🎧" size={84} /></div>
    </div>
    {viewer.user && (
      <div className="statrow">
        <span><Emo e="✅" size={20} /> تعلمت {learned} كلمة</span>
        <span><Emo e="🏆" size={20} /> {quizzes} اختبار</span>
      </div>
    )}
    <div className="twoband">
      <Link href="/learn" className="jobsband big">
        <span className="e"><Emo e="🎯" size={54} /></span>
        <div><h3>برنامج التعلم خطوة بخطوة</h3><span className="muted">دروس مرتبة من الصفر: شرح، كلمات، حوار، واختبار</span></div>
        <span className="btn small green">ابدأ</span>
      </Link>
      <Link href="/dictionary" className="jobsband big">
        <span className="e"><Emo e="📕" size={54} /></span>
        <div><h3>القاموس</h3><span className="muted">ابحث عن أي كلمة، بالإسبانية أو العربية</span></div>
      </Link>
    </div>
    <div className="cols">
      <div className="stack">
        <div className="lbl"><h2>اختر موضوعا</h2><span>كل كلمة بالإسبانية مع ترجمتها ({lang.name})</span></div>
        <div className="grid">{shown.map(tile)}</div>
        {jobs.length > 0 && (<>
          <div className="lbl"><h2>اختر عملك</h2><Link href="/jobs" className="muted">الكل ←</Link></div>
          <div className="jobs">
            {jobs.map((j) => (
              <Link key={j.id} href={`/jobs?job=${j.id}`} className="job">
                <span className="e"><Emo e={j.emoji} size={44} /></span><b>{j.name}</b>
              </Link>
            ))}
          </div>
        </>)}
        {packages.length > 0 && (<>
          <div className="lbl"><h2>الامتحانات الرسمية</h2><span>مجانا، بحساب Google</span></div>
          <div className="grid">{packages.map(tile)}</div>
        </>)}
      </div>
      <div className="stack">
        {wod && (
          <div className="fc">
            <div className="fchead"><b>كلمة اليوم</b><span>{wodTopic?.name}</span></div>
            <div className="pic"><Emo e={wod.emoji} size={90} /></div>
            <div className="word es" lang="es">{wod.es}</div>
            <Speak text={wod.es} audio={wod.audio_url} />
            <div className="tr"><div><small>{lang.name}</small> {tr(wod.tr, lang.code)}</div></div>
            <Link href={`/topic/${wod.topic_id}?level=1`} className="btn green" style={{ marginTop: 12 }}>تعلّم المزيد من هذا الموضوع</Link>
          </div>
        )}
        <Link href={`/quiz?level=${level}`} className="jobsband">
          <span className="e"><Emo e="🏆" size={44} /></span>
          <div><h3>اختبار المستوى {LEVELS[level].name}</h3><span className="muted">10 أسئلة، والنجاح بـ 70%</span></div>
        </Link>
      </div>
    </div>
  </>);
}
