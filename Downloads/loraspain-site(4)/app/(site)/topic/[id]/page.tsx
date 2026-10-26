import Link from 'next/link';
import { notFound } from 'next/navigation';
import Book from '@/components/Book';
import Emo from '@/components/Emo';
import IconGrid from '@/components/IconGrid';
import Lesson from '@/components/Lesson';
import LessonPlayer from '@/components/LessonPlayer';
import { PACKAGE_LESSONS } from '@/lib/course';
import LockBox from '@/components/LockBox';
import Quiz, { type QItem } from '@/components/Quiz';
import { canOpen, getViewer, isSoon } from '@/lib/access';
import { currentLang, loadCards, loadQuestions, loadSite, tr } from '@/lib/data';
import { knownFor, loadProgress } from '@/lib/progress';
import { LEVELS, parseLevel, type Level } from '@/lib/types';
import { PREVIEW, toLesson } from '@/lib/view';

const MODES = [
  { id: 'book', icon: '📖', label: 'كتاب' },
  { id: 'cards', icon: '🗂️', label: 'بطاقات' },
  { id: 'grid', icon: '🖼️', label: 'أيقونات' },
  { id: 'quiz', icon: '🏆', label: 'أسئلة' },
] as const;
type Mode = (typeof MODES)[number]['id'] | 'lessons';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = (await loadSite()).topics.find((x) => x.id === id && x.published);
  if (!t) return {};
  return {
    title: `${t.name} · ${t.name_es}`,
    description: t.blurb || `كلمات وجمل «${t.name}» بالإسبانية مع الترجمة العربية والنطق الصحيح، مجانا.`,
    alternates: { canonical: `/topic/${t.id}` },
  };
}

export default async function TopicPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ level?: string; mode?: string; tab?: string; ch?: string }>;
}) {
  const [{ id }, sp, site] = await Promise.all([params, searchParams, loadSite()]);
  const { topics, languages, settings } = site;
  const t = topics.find((x) => x.id === id && x.published);
  if (!t) notFound();
  const level = parseLevel(sp.level);
  // «قريبا»: يظهر الموضوع بدون محتوى حتى يجهز من المصدر الرسمي (المدير يراه عاديا)
  if (isSoon(t, settings) && !(await getViewer()).isAdmin) return (<>
    <div className={`th ${t.color}`}>
      <Emo e={t.emoji} size={64} />
      <div className="m"><h1>{t.name}</h1><span className="es" lang="es" style={{ textAlign: 'right' }}>{t.name_es}</span></div>
    </div>
    <div className="fc big done soonbox">
      <Emo e="⏳" size={90} />
      <h2>قريبا</h2>
      <p className="muted">نحضّر هذه الباقة من المصدر الرسمي في إسبانيا ونترجمها إلى العربية، حتى تكون كل الأسئلة صحيحة. ستظهر هنا عندما تجهز.</p>
      <div className="acts" style={{ width: '100%' }}>
        <Link className="btn green" href="/learn">ابدأ برنامج التعلم الآن</Link>
        <Link className="btn soft" href="/">الرئيسية</Link>
      </div>
    </div>
  </>);
  // الباقات الرسمية (السياقة…) عندها دروس مرتبة من المصدر الرسمي، وهي الطريقة الافتراضية
  const chapters = PACKAGE_LESSONS[t.id] ?? [];
  const modeList: { id: Mode; icon: string; label: string }[] = [...(chapters.length ? [{ id: 'lessons' as Mode, icon: '🎓', label: 'الدروس' }] : []), ...MODES];
  const mode: Mode = modeList.find((m) => m.id === (sp.mode ?? (sp.tab === 'quiz' ? 'quiz' : '')))?.id ?? (chapters.length ? 'lessons' : 'book');
  const [lang, viewer, cardsAll, questionsAll] = await Promise.all([currentLang(languages), getViewer(), loadCards([t.id]), loadQuestions(t.id)]);

  const progress = await loadProgress(viewer.user?.id);
  const known = knownFor(progress, t.id);
  // كل المستويات مفتوحة لمن يستطيع فتح الموضوع
  const open = canOpen(t, viewer);
  const all = cardsAll.filter((c) => c.level === level);
  const questions = questionsAll.filter((q) => q.level === level);
  // المحتوى المقفل لا يُرسل إلى المتصفح أصلا
  const cards = toLesson(open ? all : all.slice(0, PREVIEW), lang.code);
  const qitems: QItem[] = (open ? questions : questions.slice(0, 1)).map((q) => {
    const x = q.tr[lang.code] ?? q.tr.ar ?? { q: '', exp: '' };
    return { kind: 'exam', prompt: x.q || 'اختر الجواب الصحيح', es: q.q, options: q.options, optionsTr: x.options, optionsLang: 'es', answer: q.answer, exp: x.exp, id: q.id, topic: q.topic_id };
  });
  const pool = open && all.length >= 4 ? all.map((c) => ({ es: c.es, t: tr(c.tr, lang.code), emoji: c.emoji, audio: c.audio_url ?? null })) : undefined;
  const best = progress.find((r) => r.topic_id === t.id && r.level === level);
  const href = (l: number, m: Mode) => `/topic/${t.id}?level=${l}&mode=${m}`;
  const levelCount = (l: number) => cardsAll.filter((c) => c.level === l).length;
  const knownHere = all.filter((c) => known.has(c.id)).length;

  const header = (
    <div className={`th ${t.color}`}>
      <Emo e={t.emoji} size={64} />
      <div className="m">
        <h1>{t.name}</h1>
        <span className="es" lang="es" style={{ textAlign: 'right' }}>{t.name_es}</span>
        <small>{all.length} كلمة وجملة · {LEVELS[level].name}{viewer.user && all.length ? ` · تعلمت ${knownHere} من ${all.length}` : ''}</small>
        {viewer.user && all.length > 0 && <div className="bar"><i style={{ width: `${Math.round((knownHere / all.length) * 100)}%` }} /></div>}
      </div>
      <nav className="seg" aria-label="المستوى">
        {([1, 2, 3] as Level[]).map((l) => (
          <Link key={l} href={href(l, mode)} aria-current={l === level}>
            {open ? '' : '🔒 '}{LEVELS[l].name} <small className="n">{levelCount(l)}</small>
          </Link>
        ))}
      </nav>
    </div>
  );
  const modes = (
    <nav className="modes" aria-label="طريقة التعلم">
      {modeList.map((m) => (
        <Link key={m.id} href={href(level, m.id)} aria-current={m.id === mode}>
          <Emo e={m.icon} size={34} /><span>{m.label}</span>
        </Link>
      ))}
    </nav>
  );
  const save = { topic: t.id, level };
  const chDone = new Set(progress.filter((r) => r.topic_id === t.id && r.level === 0).flatMap((r) => r.known));
  const chBase = `/topic/${t.id}?mode=lessons`;
  const chIdx = chapters.findIndex((c) => c.id === sp.ch);
  const chOpen = (i: number) => open || i === 0;
  const lessonsBody = chIdx >= 0 && chOpen(chIdx)
    ? (<>
        <div className="crumb"><Link href={chBase}>← كل الدروس</Link><span>الدرس {chIdx + 1} من {chapters.length}</span></div>
        <LessonPlayer key={sp.ch} lesson={chapters[chIdx]} signedIn={!!viewer.user} sound={settings.sound_enabled !== '0'}
          next={chapters[chIdx + 1] && chOpen(chIdx + 1) ? { id: chapters[chIdx + 1].id, title: chapters[chIdx + 1].title_ar } : null}
          save={{ topic: t.id, level: 0 }} base={`${chBase}&ch=`} backHref={chBase} backLabel="العودة إلى الدروس" />
      </>)
    : (
      <div className="chaps">
        {chapters.map((c, i) => {
          const inner = (<>
            <span className="n">{chDone.has(c.id) ? '✓' : chOpen(i) ? i + 1 : '🔒'}</span>
            <Emo e={c.emoji} size={40} />
            <span className="m"><b>{c.title_ar}</b><small className="es" lang="es">{c.title_es}</small><small className="muted">{c.quiz.length} أسئلة رسمية{i === 0 && !open ? ' · بدون حساب' : ''}</small></span>
          </>);
          return chOpen(i)
            ? <Link key={c.id} href={`${chBase}&ch=${c.id}`} className={'chap' + (chDone.has(c.id) ? ' done' : '')}>{inner}</Link>
            : <span key={c.id} className="chap locked" aria-disabled="true">{inner}</span>;
        })}
      </div>
    );
  const body = mode === 'lessons' ? lessonsBody
    : mode === 'quiz'
    ? <Quiz key={`${t.id}-${level}`} title={`أسئلة ${t.name}`} items={qitems} pool={pool} sound={settings.sound_enabled !== '0'} save={viewer.user ? save : undefined}
        best={best?.quiz_best != null && best.quiz_total ? { score: best.quiz_best, total: best.quiz_total } : null} />
    : mode === 'cards' ? <Lesson cards={cards} langName={lang.name} locked={open ? 0 : all.length - cards.length} save={viewer.user ? save : undefined} known={[...known]} />
    : mode === 'grid' ? <IconGrid cards={cards} />
    : <Book cards={cards} title={t.name} />;

  return (<>
    {header}
    {modes}
    {body}
    {!open && <LockBox topic={t} />}
  </>);
}
