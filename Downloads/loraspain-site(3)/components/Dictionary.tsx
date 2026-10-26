'use client';
import { useEffect, useMemo, useState } from 'react';
import Emo from './Emo';
import { speak } from './Speak';

type Row = [es: string, pos: string, ar: string, ex: string, exar: string, e: string];
const POS: Record<string, string> = { n: 'اسم', v: 'فعل', adj: 'صفة', adv: 'ظرف', prep: 'حرف جر', conj: 'أداة ربط', pron: 'ضمير', det: 'أداة', num: 'عدد', interj: 'تعجب', expr: 'عبارة' };
// نبحث بدون الحركات والنبرات: «arbol» تجد «árbol»، و«ماء» تجد «الماء»
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ًͯ-ْ]/g, '').replace(/^(el|la|los|las) /, '').replace(/^ال/, '').trim();
const PAGE = 60;

export default function Dictionary() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [q, setQ] = useState('');
  const [letter, setLetter] = useState('');
  const [n, setN] = useState(PAGE);
  useEffect(() => { fetch('/dict.json').then((r) => r.json()).then(setRows).catch(() => setRows([])); }, []);
  const index = useMemo(() => (rows ?? []).map((r) => [norm(r[0]), norm(r[2])] as const), [rows]);
  const list = useMemo(() => {
    if (!rows) return [];
    const k = norm(q);
    const out: Row[] = [];
    rows.forEach((r, i) => {
      if (k ? index[i][0].startsWith(k) || index[i][0].includes(' ' + k) || index[i][1].includes(k) : !letter || index[i][0].startsWith(letter)) out.push(r);
    });
    // البحث: الكلمات التي تبدأ بما كتبت أولا
    if (k) out.sort((a, b) => Number(!norm(a[0]).startsWith(k)) - Number(!norm(b[0]).startsWith(k)));
    return out;
  }, [rows, index, q, letter]);
  useEffect(() => setN(PAGE), [q, letter]);

  if (!rows) return <p className="muted">جارٍ تحميل القاموس…</p>;
  if (!rows.length) return <div className="empty">القاموس قيد التحضير.</div>;
  return (
    <div className="stack">
      <input className="in dsearch" type="search" placeholder="ابحث: casa ، trabajar ، عمل…" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
      {!q && (
        <nav className="abc" aria-label="الحروف">
          <button type="button" aria-current={!letter} onClick={() => setLetter('')}>الكل</button>
          {'abcdefghijlmnopqrstuvxyz'.split('').map((l) => <button key={l} type="button" aria-current={l === letter} onClick={() => setLetter(l)}>{l.toUpperCase()}</button>)}
        </nav>
      )}
      <p className="muted" style={{ margin: 0 }}>{list.length} كلمة من {rows.length}</p>
      <div className="dlist">
        {list.slice(0, n).map((r) => (
          <article key={r[0]} className="dent">
            <div className="dh">
              {r[5] ? <Emo e={r[5]} size={40} /> : <span className="dpos">{POS[r[1]] ?? ''}</span>}
              <button type="button" className="dw es" lang="es" onClick={() => speak(r[0])}>{r[0]} <span aria-hidden="true">🔊</span></button>
              {r[5] && <span className="dpos">{POS[r[1]] ?? ''}</span>}
            </div>
            <div className="dar">{r[2]}</div>
            {r[3] && <div className="dex"><button type="button" className="es" lang="es" onClick={() => speak(r[3])}>{r[3]}</button><small>{r[4]}</small></div>}
          </article>
        ))}
      </div>
      {n < list.length && <button type="button" className="btn ghost" onClick={() => setN(n + PAGE)}>عرض المزيد ({list.length - n})</button>}
    </div>
  );
}
