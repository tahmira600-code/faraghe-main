import Link from 'next/link';
import type { Topic } from '@/lib/types';

const MSG: Record<string, string> = { saved: 'تم الحفظ ✓', deleted: 'تم الحذف ✓', imported: 'تم استيراد المحتوى الأولي ✓' };
export function Ok({ ok }: { ok?: string }) {
  if (!ok) return null;
  const m = ok.startsWith('audio') ? `تم توليد الصوت لـ ${ok.slice(5)} بطاقة ✓` : MSG[ok];
  return m ? <div className="okmsg">{m}</div> : null;
}

export function TopicFilter({ topics, current, base }: { topics: Topic[]; current: string; base: string }) {
  return (
    <nav className="subs">
      {topics.map((t) => <Link key={t.id} href={`${base}?topic=${t.id}`} aria-current={t.id === current}>{t.emoji} {t.name}</Link>)}
    </nav>
  );
}
