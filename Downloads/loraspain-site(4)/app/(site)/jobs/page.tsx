import Link from 'next/link';
import Emo from '@/components/Emo';
import LockBox from '@/components/LockBox';
import Report from '@/components/Report';
import Speak from '@/components/Speak';
import { canOpen, getViewer } from '@/lib/access';
import { currentLang, loadCards, loadSite, tr } from '@/lib/data';
import { LEVELS, parseLevel, type Level } from '@/lib/types';
import { PREVIEW } from '@/lib/view';

export const metadata = { title: 'الإسبانية للعمل', description: 'الجمل الإسبانية التي تحتاجها كل يوم في عملك في إسبانيا، مع الترجمة العربية والنطق.', alternates: { canonical: '/jobs' } };

export default async function Jobs({ searchParams }: { searchParams: Promise<{ job?: string; s?: string; level?: string }> }) {
  const sp = await searchParams;
  const [{ topics, languages }, viewer] = await Promise.all([loadSite(), getViewer()]);
  const level = parseLevel(sp.level);
  const lang = await currentLang(languages);
  const jobs = topics.filter((t) => t.kind === 'job' && t.published);
  const cards = await loadCards(jobs.map((j) => j.id));
  const job = jobs.find((j) => j.id === sp.job) ?? jobs.find((j) => cards.some((c) => c.topic_id === j.id)) ?? jobs[0];
  if (!job) return <div className="empty">لا توجد مهن بعد.</div>;
  const open = canOpen(job, viewer);
  const mine = cards.filter((c) => c.topic_id === job.id && c.level === level);
  const q = (extra: string) => `/jobs?job=${job.id}&level=${level}${extra}`;
  const sections = [...new Set(mine.map((c) => c.section).filter(Boolean))];
  const section = sections.includes(sp.s ?? '') ? sp.s! : '';
  const list = mine.filter((c) => !section || c.section === section);
  const shown = open ? list : list.slice(0, PREVIEW);

  return (<>
    <div className="hd"><div><h1>اختر عملك</h1><p>الكلام الذي تحتاجه كل يوم في عملك، بالإسبانية مع الترجمة والنطق.</p></div>
      <nav className="seg" aria-label="المستوى">
        {([1, 2, 3] as Level[]).map((l) => <Link key={l} href={`/jobs?job=${job.id}&level=${l}`} aria-current={l === level}>{open ? '' : '🔒 '}{LEVELS[l].name}</Link>)}
      </nav>
    </div>
    <nav className="jobs" aria-label="المهن">
      {jobs.map((j) => {
        const n = cards.filter((c) => c.topic_id === j.id).length;
        return (
          <Link key={j.id} href={`/jobs?job=${j.id}&level=${level}`} className="job" aria-current={j.id === job.id}>
            <span className="e"><Emo e={j.emoji} size={44} /></span><b>{j.name}</b><small>{n ? `${n} جملة` : 'قريبا'}</small>
          </Link>
        );
      })}
    </nav>
    <div className="lbl">
      <h2><Link href={`/topic/${job.id}?level=${level}`}>{job.name}</Link></h2>
      {sections.length > 0 && (
        <nav className="subs">
          <Link href={q('')} aria-current={!section}>الكل</Link>
          {sections.map((s) => <Link key={s} href={q(`&s=${encodeURIComponent(s)}`)} aria-current={s === section}>{s}</Link>)}
        </nav>
      )}
    </div>
    {mine.length === 0 ? <div className="empty">نحضّر جمل «{job.name}» الآن. ستظهر هنا قريبا.</div> : (<>
      <div className="ph">
        {shown.map((c) => (
          <div key={c.id} className="pc">
            <div className="r"><span className="pic"><Emo e={c.emoji} size={40} /></span><span className="w es" lang="es">{c.es}</span><Speak text={c.es} audio={c.audio_url} size="sm" /></div>
            <div className="t"><small>{lang.name}</small>{tr(c.tr, lang.code)}</div>
            <Report id={c.id} topic={c.topic_id} text={`${c.es} = ${tr(c.tr, lang.code)}`} />
          </div>
        ))}
      </div>
      {!open && <LockBox topic={job} />}
      {open && <div className="tip">💡 احفظ كل يوم 5 جمل من عملك، ثم اختبر نفسك في صفحة الاختبارات.</div>}
    </>)}
  </>);
}
