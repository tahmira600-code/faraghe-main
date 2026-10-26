'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Report from './Report';
import { speak } from './Speak';
import { saveProgress } from './progress';

// سؤال جاهز: نص السؤال، الاختيارات، رقم الجواب، وشرح بعد الجواب
export type QItem = {
  kind: 'meaning' | 'listen' | 'say' | 'exam';
  prompt: string; es?: string; audio?: string | null; trq?: string;
  options: string[]; optionsLang: 'es' | 'tr'; answer: number; optionsTr?: string[];
  exp: string;
  id?: string; topic?: string;
};

const shuffle = <T,>(xs: T[]) => { const a = [...xs]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

type Entry = { es: string; t: string; emoji: string; audio?: string | null };
// اختبار المستوى: يُبنى من البطاقات (معنى، استماع، ترجمة)
export function buildFromCards(pool: Entry[], n = 10, sound = true): QItem[] {
  const kinds = sound ? (['meaning', 'listen', 'say'] as const) : (['meaning', 'say'] as const);
  return shuffle(pool).slice(0, n).map((e, i) => {
    const kind = kinds[i % kinds.length];
    const field = kind === 'meaning' ? 't' : 'es';
    const wrong = shuffle(pool.filter((x) => x[field] !== e[field])).slice(0, 3).map((x) => x[field]);
    const options = shuffle([e[field], ...wrong]);
    return {
      kind,
      prompt: kind === 'meaning' ? 'ماذا تعني هذه الكلمة أو الجملة؟' : kind === 'listen' ? 'اسمع، ثم اختر ما سمعت' : 'كيف تقول هذا بالإسبانية؟',
      es: kind === 'say' ? undefined : e.es, audio: e.audio, trq: kind === 'say' ? `${e.emoji} ${e.t}` : undefined,
      options, optionsLang: field === 'es' ? 'es' : 'tr', answer: options.indexOf(e[field]),
      exp: `${e.es} = ${e.t}`,
    };
  });
}

export default function Quiz({ title, items, pool, passPct = 70, after, sound = true, save, best }: {
  title: string; items?: QItem[]; pool?: Entry[]; passPct?: number; after?: { href: string; label: string }; sound?: boolean;
  save?: { topic: string; level: number }; best?: { score: number; total: number } | null;
}) {
  const [qs, setQs] = useState<QItem[] | null>(pool ? null : items ?? null);
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const poolKey = useMemo(() => JSON.stringify(pool ?? []), [pool]);
  // أسئلة جاهزة (إن وُجدت) ثم أسئلة من البطاقات حتى تصل إلى 10 على الأقل
  const build = () => { const fixed = shuffle(items ?? []).slice(0, 15); return pool ? [...fixed, ...buildFromCards(pool, Math.max(0, 10 - fixed.length), sound)] : fixed; };
  useEffect(() => { if (pool) setQs(build()); }, [poolKey]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!qs) return <p className="muted">جارٍ تحضير الأسئلة…</p>;
  if (!qs.length) return <div className="empty">لا توجد أسئلة بعد.</div>;
  const restart = () => { setQs(build()); setI(0); setPick(null); setScore(0); };

  if (i >= qs.length) {
    const pass = (score / qs.length) * 100 >= passPct;
    return (
      <div className="fc big done">
        <span className="big">{pass ? '🏆' : '💪'}</span>
        <h2>{pass ? 'مبروك! نجحت' : 'قريب! راجع ثم أعد المحاولة'}</h2>
        <div className="score" style={{ boxShadow: 'none' }}><span className="n" dir="ltr">{score} / {qs.length}</span></div>
        <p className="muted">النجاح بـ {passPct}% من الأجوبة الصحيحة.{best ? ` أحسن نتيجة سابقة: ${best.score} / ${best.total}` : ''}</p>
        <div className="acts" style={{ width: '100%' }}>
          <button type="button" className="btn soft" onClick={restart}>أعد الاختبار</button>
          {pass && after && <Link className="btn green" href={after.href}>{after.label}</Link>}
        </div>
      </div>
    );
  }

  const q = qs[i];
  const answered = pick !== null;
  return (
    <div className="lesson">
      <div className="stack">
        <div className="qtop"><div className="bar"><i style={{ width: `${(i / qs.length) * 100}%` }} /></div><span className="muted" dir="ltr">{i + 1} / {qs.length}</span></div>
        <div className="qc">
          <h2>{q.prompt}</h2>
          {q.kind === 'listen' ? (
            <div className="w"><button type="button" className="btn" onClick={() => speak(q.es!, false, q.audio)}>🔊 استمع</button>
              <button type="button" className="btn soft small" onClick={() => speak(q.es!, true, q.audio)}>ببطء</button></div>
          ) : q.es ? (
            <div className="w"><button type="button" className="play sm" aria-label="استمع" onClick={() => speak(q.es!, false, q.audio)}>🔊</button><b className="es" lang="es">{q.es}</b></div>
          ) : null}
          {q.trq && <div className="trq">{q.trq}</div>}
          <div className="opts">
            {q.options.map((o, k) => (
              <button key={k} type="button" disabled={answered} lang={q.optionsLang === 'es' ? 'es' : undefined}
                className={'opt' + (q.optionsLang === 'es' ? ' es' : '') + (!answered ? '' : k === q.answer ? ' right' : k === pick ? ' wrong' : '')}
                onClick={() => { setPick(k); if (k === q.answer) setScore(score + 1); }}>
                {answered && k === q.answer ? '✓ ' : ''}{o}{q.optionsTr?.[k] && <small className="otr">{q.optionsTr[k]}</small>}
              </button>
            ))}
          </div>
        </div>
        {answered && (
          <div className={'fb ' + (pick === q.answer ? 'ok' : 'no')}>
            <span className="big">{pick === q.answer ? '🎉' : '💡'}</span>
            <div className="m"><b>{pick === q.answer ? 'أحسنت! جواب صحيح' : 'ليس هذا، انتبه للجواب الصحيح'}</b><span>{q.exp}</span></div>
            <button type="button" className="btn green" onClick={() => { if (i + 1 >= qs.length && save) saveProgress({ ...save, score, total: qs.length }); setI(i + 1); setPick(null); }}>{i + 1 < qs.length ? 'متابعة' : 'النتيجة'}</button>
          </div>
        )}
        {q.id && <Report key={q.id} type="question" id={q.id} topic={q.topic} text={q.es ?? ''} />}
      </div>
      <div className="score">
        <h3>{title}</h3>
        <span className="n" dir="ltr">{score} / {i + (answered ? 1 : 0)}</span>
        <div className="row"><span>صحيح</span><b>{score}</b></div>
        <div className="row"><span>خطأ</span><b>{i + (answered ? 1 : 0) - score}</b></div>
        <div className="row"><span>للنجاح</span><b>{Math.ceil((qs.length * passPct) / 100)} من {qs.length}</b></div>
      </div>
    </div>
  );
}
