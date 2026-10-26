'use client';
import Link from 'next/link';
import { useState } from 'react';
import Emo from './Emo';
import { DONE_KEY, localDone } from './CoursePath';
import { speak } from './Speak';
import { saveProgress } from './progress';
import type { Lesson } from '@/lib/course';

const STEPS = [
  { id: 'learn', label: 'الشرح', icon: '💡' },
  { id: 'words', label: 'الكلمات', icon: '📝' },
  { id: 'dialog', label: 'الحوار', icon: '💬' },
  { id: 'quiz', label: 'الاختبار', icon: '🏆' },
] as const;

function Say({ text }: { text: string }) {
  return <button type="button" className="sayb" aria-label="استمع" onClick={() => speak(text)}>🔊</button>;
}

// درس كامل: شرح ← كلمات ← حوار ← اختبار، ثم يُحفظ الدرس كمكتمل ويُفتح الذي بعده
export default function LessonPlayer({ lesson, next, signedIn, sound, save = { topic: 'course', level: 0 }, base = '/learn/', backHref = '/learn', backLabel = 'العودة إلى البرنامج' }: {
  lesson: Lesson; next: { id: string; title: string } | null; signedIn: boolean; sound: boolean;
  save?: { topic: string; level: number }; base?: string; backHref?: string; backLabel?: string;
}) {
  const steps = STEPS.filter((s) => s.id !== 'dialog' || lesson.dialog.length);
  const [step, setStep] = useState(0);
  const [qi, setQi] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const pass = Math.ceil(lesson.quiz.length * 0.6);

  function finish(final: number) {
    setFinished(true);
    if (final < pass) return;
    if (save.topic === 'course') try { localStorage.setItem(DONE_KEY, JSON.stringify([...new Set([...localDone(), lesson.id])])); } catch { /* المتصفح يمنع التخزين */ }
    if (signedIn) saveProgress({ ...save, known: [lesson.id] });
  }

  const S = steps[step].id;
  const go = (id: string) => setStep(steps.findIndex((s) => s.id === id));
  return (
    <div className={'lp' + (sound ? '' : ' nosound')}>
      <header className="lphead">
        <Emo e={lesson.emoji} size={56} />
        <div><h1>{lesson.title_ar}</h1><span className="es" lang="es">{lesson.title_es}</span></div>
      </header>
      <nav className="steps" aria-label="مراحل الدرس">
        {steps.map((s, i) => (
          <button key={s.id} type="button" aria-current={i === step} className={i < step ? 'ok' : ''} onClick={() => setStep(i)}>
            <Emo e={s.icon} size={22} /><span>{s.label}</span>
          </button>
        ))}
      </nav>

      {S === 'learn' && (
        <div className="stack">
          {lesson.goal_ar && <div className="goal"><Emo e="🎯" size={28} /> {lesson.goal_ar}</div>}
          {lesson.explain.map((b, i) => (
            <div key={i} className="exb">
              <h3>{b.h}</h3>
              <p>{b.p}</p>
              {b.ex?.map(([es, ar], k) => (
                <div key={k} className="exr"><Say text={es} /><b className="es" lang="es">{es}</b><small>{ar}</small></div>
              ))}
              {b.ref && <small className="ref">📌 المصدر: <span dir="ltr">{b.ref}</span></small>}
            </div>
          ))}
          <button type="button" className="btn green big" onClick={() => go('words')}>فهمت، إلى الكلمات ←</button>
        </div>
      )}

      {S === 'words' && (
        <div className="stack">
          <div className="igrid">
            {lesson.words.map((w) => (
              <button key={w.es} type="button" className="icell" onClick={() => speak(w.es)}>
                {w.e ? <Emo e={w.e} size={56} /> : <span className="emo t" style={{ fontSize: 40 }}>🔤</span>}
                <b className="es" lang="es">{w.es}</b><small>{w.ar}</small>
              </button>
            ))}
          </div>
          <button type="button" className="btn green big" onClick={() => go(lesson.dialog.length ? 'dialog' : 'quiz')}>{lesson.dialog.length ? 'إلى الحوار ←' : 'إلى الاختبار ←'}</button>
        </div>
      )}

      {S === 'dialog' && (
        <div className="stack">
          <div className="dlg">
            {lesson.dialog.map((d, i) => (
              <div key={i} className={'bub ' + (d.who === 'A' ? 'a' : 'b')}>
                <span className="who">{d.who === 'A' ? <Emo e="🧑" size={30} /> : <Emo e="👩" size={30} />}</span>
                <div><div className="l"><Say text={d.es} /><b className="es" lang="es">{d.es}</b></div><small>{d.ar}</small></div>
              </div>
            ))}
          </div>
          <button type="button" className="btn green big" onClick={() => go('quiz')}>إلى الاختبار ←</button>
        </div>
      )}

      {S === 'quiz' && !finished && lesson.quiz[qi] && (() => {
        const q = lesson.quiz[qi], answered = pick !== null;
        return (
          <div className="stack">
            <div className="qtop"><div className="bar"><i style={{ width: `${(qi / lesson.quiz.length) * 100}%` }} /></div><span className="muted" dir="ltr">{qi + 1} / {lesson.quiz.length}</span></div>
            <div className="qc">
              {q.es && <div className="qes"><Say text={q.es} /><b className="es" lang="es">{q.es}</b></div>}
              <h2>{q.q}</h2>
              <div className="opts">
                {q.o.map((o, k) => (
                  <button key={k} type="button" disabled={answered}
                    className={'opt' + (!answered ? '' : k === q.a ? ' right' : k === pick ? ' wrong' : '')}
                    onClick={() => { setPick(k); if (k === q.a) setScore(score + 1); }}>{q.otr ? <><span className="es" lang="es">{o}</span><small className="otr">{q.otr[k]}</small></> : o}</button>
                ))}
              </div>
            </div>
            {answered && (
              <div className={'fb ' + (pick === q.a ? 'ok' : 'no')}>
                <span className="big">{pick === q.a ? '🎉' : '💡'}</span>
                <div className="m"><b>{pick === q.a ? 'أحسنت!' : 'انتبه'}</b><span>{q.why}</span></div>
                <button type="button" className="btn green" onClick={() => {
                  if (qi + 1 >= lesson.quiz.length) finish(score); else { setQi(qi + 1); setPick(null); }
                }}>{qi + 1 < lesson.quiz.length ? 'متابعة' : 'النتيجة'}</button>
              </div>
            )}
          </div>
        );
      })()}

      {S === 'quiz' && finished && (
        <div className="fc big done">
          <Emo e={score >= pass ? '🏆' : '💪'} size={90} />
          <h2>{score >= pass ? 'أكملت الدرس!' : 'قريب! أعد الدرس'}</h2>
          <p className="muted" dir="ltr">{score} / {lesson.quiz.length}</p>
          <p className="muted">{score >= pass ? (signedIn ? 'حُفظ تقدمك في حسابك.' : 'حُفظ تقدمك في هذا الجهاز. سجّل الدخول لتحفظه في حسابك.') : `تحتاج ${pass} أجوبة صحيحة لتفتح الدرس التالي.`}</p>
          <div className="acts" style={{ width: '100%' }}>
            <button type="button" className="btn soft" onClick={() => { setStep(0); setQi(0); setPick(null); setScore(0); setFinished(false); }}>أعد الدرس</button>
            {score >= pass && (next ? <Link className="btn green" href={`${base}${next.id}`}>الدرس التالي: {next.title}</Link> : <Link className="btn green" href={backHref}>{backLabel}</Link>)}
          </div>
        </div>
      )}
    </div>
  );
}
