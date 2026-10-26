'use client';
import { useState } from 'react';

const KINDS: [string, string][] = [['sound', '🔊 النطق غير صحيح'], ['translation', '🌐 الترجمة خطأ'], ['spanish', '✍️ خطأ في الإسبانية'], ['image', '🖼️ الصورة غير مناسبة'], ['other', '💬 شيء آخر']];

// زر صغير في كل بطاقة وسؤال: يرسل البلاغ إلى لوحة التحكم
export default function Report({ type = 'card', id, topic, text }: { type?: 'card' | 'question'; id: string; topic?: string; text: string }) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState('');
  const [note, setNote] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  async function send() {
    setState('sending');
    const r = await fetch('/api/report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, id, topic, text, kind, note }) }).catch(() => null);
    setState(r?.ok ? 'done' : 'error');
  }

  if (state === 'done') return <p className="rep-done">شكرا! وصلنا بلاغك وسنصلحه.</p>;
  if (!open) return <button type="button" className="rep-btn" onClick={() => setOpen(true)}>⚑ هل هناك مشكلة؟</button>;
  return (
    <div className="rep">
      <b>ما المشكلة؟</b>
      <div className="rep-kinds">
        {KINDS.map(([k, label]) => <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)}>{label}</button>)}
      </div>
      <textarea className="in" placeholder="اكتب ملاحظة إذا أردت (اختياري)" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} />
      <div className="rowf">
        <button type="button" className="btn small" disabled={!kind || state === 'sending'} onClick={send}>{state === 'sending' ? 'جارٍ الإرسال…' : 'أرسل البلاغ'}</button>
        <button type="button" className="btn ghost small" onClick={() => setOpen(false)}>إلغاء</button>
        {state === 'error' && <span className="err">لم يُرسل. حاول مرة أخرى.</span>}
      </div>
    </div>
  );
}
