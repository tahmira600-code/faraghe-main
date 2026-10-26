'use client';
import { useEffect, useRef, useState } from 'react';
import Emo from './Emo';
import type { LessonCard } from './Lesson';
import { speak } from './Speak';

const PER_PAGE = 5;
const PLAY = <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z" /></svg>;

// صفحات الكتاب: كل قسم يبدأ صفحة جديدة، وفي كل صفحة 5 كلمات
function paginate(cards: LessonCard[]) {
  const pages: { section: string; cards: LessonCard[] }[] = [];
  const bySection = new Map<string, LessonCard[]>();
  cards.forEach((c) => { const s = c.section || ''; if (!bySection.has(s)) bySection.set(s, []); bySection.get(s)!.push(c); });
  bySection.forEach((list, section) => { for (let i = 0; i < list.length; i += PER_PAGE) pages.push({ section, cards: list.slice(i, i + PER_PAGE) }); });
  return pages;
}

export default function Book({ cards, title }: { cards: LessonCard[]; title: string }) {
  const pages = paginate(cards);
  const [two, setTwo] = useState(false);
  const [p, setP] = useState(0);
  const [dir, setDir] = useState<'next' | 'prev'>('next');
  const touch = useRef<number | null>(null);
  useEffect(() => {
    const m = matchMedia('(min-width: 900px)');
    const f = () => setTwo(m.matches);
    f(); m.addEventListener('change', f);
    return () => m.removeEventListener('change', f);
  }, []);
  useEffect(() => { setP(0); }, [cards]);
  const step = two ? 2 : 1;
  const start = Math.min(p - (p % step), Math.max(0, pages.length - 1));
  const go = (d: 1 | -1) => {
    const n = start + d * step;
    if (n < 0 || n >= pages.length) return;
    setDir(d > 0 ? 'next' : 'prev'); setP(n);
  };
  useEffect(() => {
    // في الكتاب العربي: السهم الأيسر = الصفحة التالية
    const k = (e: KeyboardEvent) => { if (e.key === 'ArrowLeft') go(1); if (e.key === 'ArrowRight') go(-1); };
    addEventListener('keydown', k);
    return () => removeEventListener('keydown', k);
  });
  if (!pages.length) return <div className="empty">لا توجد كلمات في هذا المستوى بعد.</div>;
  const shown = pages.slice(start, start + step);
  const sections = [...new Set(pages.map((x) => x.section))].filter(Boolean);

  return (
    <div className="book-wrap">
      {sections.length > 1 && (
        <nav className="subs" aria-label="الفصول">
          {sections.map((s) => {
            const at = pages.findIndex((x) => x.section === s);
            return <button key={s} type="button" aria-current={shown.some((x) => x.section === s)} onClick={() => { setDir(at > start ? 'next' : 'prev'); setP(at); }}>{s}</button>;
          })}
        </nav>
      )}
      <div className="book" onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => { if (touch.current === null) return; const dx = e.changedTouches[0].clientX - touch.current; touch.current = null; if (Math.abs(dx) > 50) go(dx > 0 ? 1 : -1); }}>
        {shown.map((pg, n) => (
          <section key={start + n} className={`bpage ${dir}`}>
            <header><span>{pg.section || title}</span><small dir="ltr">{start + n + 1}</small></header>
            {pg.cards.map((c) => (
              <button key={c.id} type="button" className="brow" onClick={() => speak(c.es, false, c.audio)}>
                <Emo e={c.emoji} size={46} />
                <span className="bt"><b className="es" lang="es">{c.es}</b><small>{c.t}</small></span>
                <span className="bp" aria-label="استمع">{PLAY}</span>
              </button>
            ))}
          </section>
        ))}
      </div>
      <div className="bnavs">
        <button type="button" className="btn ghost small" onClick={() => go(-1)} disabled={start === 0}>→ السابقة</button>
        <span className="muted" dir="ltr">{start + 1}{step === 2 && start + 2 <= pages.length ? `–${start + 2}` : ''} / {pages.length}</span>
        <button type="button" className="btn small" onClick={() => go(1)} disabled={start + step >= pages.length}>التالية ←</button>
      </div>
    </div>
  );
}
