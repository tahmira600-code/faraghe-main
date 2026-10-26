'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Emo from './Emo';
import { LEVELS, type Level } from '@/lib/types';

type L = { id: string; title_ar: string; title_es: string; emoji: string };
type U = { unit: number; level: number; title_ar: string; title_es: string; emoji: string; open: boolean; lessons: L[] };

export const DONE_KEY = 'ls_course_done';
export function localDone(): string[] {
  try { return JSON.parse(localStorage.getItem(DONE_KEY) ?? '[]'); } catch { return []; }
}

// المسار: كل درس يُفتح بعد إكمال الذي قبله. التقدم من الحساب، أو من هذا الجهاز للزائر
export default function CoursePath({ units, serverDone, signedIn }: { units: U[]; serverDone: string[]; signedIn: boolean }) {
  const [done, setDone] = useState(new Set(serverDone));
  useEffect(() => { setDone(new Set([...serverDone, ...localDone()])); }, [serverDone]);
  const all = units.flatMap((u) => u.lessons);
  const current = all.find((l) => !done.has(l.id))?.id;
  const total = all.length, finished = all.filter((l) => done.has(l.id)).length;

  return (
    <div className="path">
      <div className="pathtop">
        <div><b>{finished} / {total}</b> درس مكتمل</div>
        <div className="bar"><i style={{ width: `${(finished / Math.max(total, 1)) * 100}%` }} /></div>
        {current && <Link className="btn green" href={`/learn/${current}`}>{finished ? 'تابع الدرس التالي' : 'ابدأ الدرس الأول'}</Link>}
        {!signedIn && <small className="muted">سجّل الدخول حتى يُحفظ تقدمك على كل أجهزتك.</small>}
      </div>
      {units.map((u, ui) => {
        const showLevel = ui === 0 || units[ui - 1].level !== u.level;
        return (
          <section key={u.unit} className="unit">
            {showLevel && <div className="lvlhead">{LEVELS[u.level as Level]?.name ?? ''} {!u.open && '🔒'}</div>}
            <header className={`uhead c${(u.unit % 7) + 1}`}>
              <Emo e={u.emoji} size={48} />
              <div><small>الوحدة {u.unit}</small><h2>{u.title_ar}</h2><span className="es" lang="es">{u.title_es}</span></div>
            </header>
            <div className="nodes">
              {u.lessons.map((l, i) => {
                const isDone = done.has(l.id), isCur = l.id === current;
                const locked = !u.open || (!isDone && !isCur);
                const cls = 'node' + (isDone ? ' done' : isCur ? ' cur' : '') + (locked ? ' locked' : '');
                const inner = (<>
                  <span className="dot">{isDone ? '✓' : locked ? '🔒' : <Emo e={l.emoji} size={34} />}</span>
                  <span className="nt"><b>{l.title_ar}</b><small className="es" lang="es">{l.title_es}</small></span>
                </>);
                return (
                  <div key={l.id} className="nrow" style={{ ['--x' as string]: `${[0, 40, 60, 40, 0, -40, -60, -40][i % 8]}px` }}>
                    {locked && !isDone ? <span className={cls} aria-disabled="true">{inner}</span> : <Link className={cls} href={`/learn/${l.id}`}>{inner}</Link>}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
