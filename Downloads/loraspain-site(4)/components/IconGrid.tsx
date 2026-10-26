'use client';
import { useState } from 'react';
import Emo from './Emo';
import type { LessonCard } from './Lesson';
import { speak } from './Speak';

// شبكة أيقونات: اضغط على الصورة فتسمع الكلمة وترى معناها
export default function IconGrid({ cards }: { cards: LessonCard[] }) {
  const [on, setOn] = useState<string | null>(null);
  const [section, setSection] = useState('');
  const sections = [...new Set(cards.map((c) => c.section || ''))].filter(Boolean);
  const list = cards.filter((c) => !section || c.section === section);
  if (!cards.length) return <div className="empty">لا توجد كلمات في هذا المستوى بعد.</div>;
  return (<>
    {sections.length > 1 && (
      <nav className="subs" aria-label="الأقسام">
        <button type="button" aria-current={!section} onClick={() => setSection('')}>الكل</button>
        {sections.map((s) => <button key={s} type="button" aria-current={s === section} onClick={() => setSection(s)}>{s}</button>)}
      </nav>
    )}
    <div className="igrid">
      {list.map((c) => (
        <button key={c.id} type="button" className={'icell' + (on === c.id ? ' on' : '')} onClick={() => { setOn(c.id); speak(c.es, false, c.audio); }}>
          <Emo e={c.emoji} size={64} />
          <b className="es" lang="es">{c.es}</b>
          <small>{c.t}</small>
        </button>
      ))}
    </div>
  </>);
}
