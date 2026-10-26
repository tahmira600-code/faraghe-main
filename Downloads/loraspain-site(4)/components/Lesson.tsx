'use client';
import { useEffect, useState } from 'react';
import Report from './Report';
import Emo from './Emo';
import Speak, { speak } from './Speak';
import { saveProgress } from './progress';

export type LessonCard = { id: string; topic: string; emoji: string; es: string; t: string; audio?: string | null; section?: string };

// درس بطاقة بطاقة: «أعرفها» أو «راجعها لاحقا»، والمراجعة تعود في الآخر
export default function Lesson({ cards, langName, locked, save, known: knownIds = [] }: {
  cards: LessonCard[]; langName: string; locked: number; save?: { topic: string; level: number }; known?: string[];
}) {
  const [i, setI] = useState(0);
  const [mark, setMark] = useState<Record<string, 'ok' | 'rev'>>({});
  const learned = new Set(knownIds);
  const [round, setRound] = useState<LessonCard[]>(cards);
  useEffect(() => { setRound(cards); setI(0); setMark({}); }, [cards]);

  const finished = i >= round.length;
  const c = round[Math.min(i, round.length - 1)];
  const known = Object.values(mark).filter((m) => m === 'ok').length;

  function answer(m: 'ok' | 'rev') {
    setMark({ ...mark, [c.id]: m });
    if (m === 'ok' && save) saveProgress({ ...save, known: [c.id] });
    setI(i + 1);
  }
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (e.key === ' ' && c) { e.preventDefault(); speak(c.es, false, c.audio); }
      if (e.key === 'ArrowLeft') setI((x) => Math.min(x + 1, round.length));
      if (e.key === 'ArrowRight') setI((x) => Math.max(x - 1, 0));
    };
    addEventListener('keydown', k);
    return () => removeEventListener('keydown', k);
  }, [c, round.length]);

  if (!cards.length) return <div className="empty">لا توجد بطاقات في هذا المستوى بعد.</div>;

  return (
    <div className="lesson">
      <div className="center">
        <div className="dots" aria-label="البطاقات">
          {round.map((x, n) => (
            <button key={x.id + n} type="button" aria-label={`البطاقة ${n + 1}`} onClick={() => setI(n)}
              className={n === i ? 'on' : mark[x.id] === 'ok' || (!mark[x.id] && learned.has(x.id)) ? 'ok' : mark[x.id] === 'rev' ? 'rev' : ''} />
          ))}
        </div>
        {finished ? (
          <div className="fc big done">
            <span className="big">🎉</span>
            <h2>أكملت البطاقات!</h2>
            <p className="muted">تعرفت على {known} من {round.length}.</p>
            <div className="acts" style={{ width: '100%' }}>
              {round.some((x) => mark[x.id] === 'rev') && (
                <button type="button" className="btn soft" onClick={() => { setRound(round.filter((x) => mark[x.id] === 'rev')); setI(0); setMark({}); }}>راجع الصعبة فقط</button>
              )}
              <button type="button" className="btn" onClick={() => { setRound(cards); setI(0); setMark({}); }}>أعد من البداية</button>
            </div>
          </div>
        ) : (<>
          <div className="fc big">
            <div className="pic"><Emo e={c.emoji} size={110} /></div>
            <div className="word es" lang="es">{c.es}</div>
            <Speak text={c.es} audio={c.audio} />
            <div className="tr"><div><small>{langName}</small> {c.t}</div></div>
          </div>
          <div className="acts">
            <button type="button" className="btn soft" onClick={() => answer('rev')}>راجعها لاحقا</button>
            <button type="button" className="btn green" onClick={() => answer('ok')}>أعرفها ✓</button>
          </div>
          <Report key={c.id} id={c.id} topic={c.topic} text={`${c.es} = ${c.t}`} />
          <div className="nav2"><span>البطاقة {i + 1} من {round.length}</span><span>المسافة = استمع · الأسهم للتنقل</span></div>
        </>)}
      </div>
      <div className="list">
        <h3>بطاقات هذا الدرس</h3>
        {round.map((x, n) => (
          <button key={x.id + n} type="button" className={'it' + (n === i ? ' cur' : '')} onClick={() => setI(n)}>
            <span className="em"><Emo e={x.emoji} size={30} /></span>
            <span><b className="es" lang="es">{x.es}</b><small>{x.t}</small></span>
            <span className="s">{mark[x.id] === 'ok' || (!mark[x.id] && learned.has(x.id)) ? '✓' : mark[x.id] === 'rev' ? '↺' : n === i ? '▶' : ''}</span>
          </button>
        ))}
        {Array.from({ length: Math.min(locked, 4) }).map((_, n) => (
          <div key={'g' + n} className="it ghost" aria-hidden="true"><span className="em">🔒</span><span><b>••••• ••••</b><small>•••••</small></span></div>
        ))}
      </div>
    </div>
  );
}
