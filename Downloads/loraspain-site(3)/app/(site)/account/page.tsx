import Link from 'next/link';
import LoginButton from '@/components/LoginButton';
import { getViewer } from '@/lib/access';
import Emo from '@/components/Emo';
import { isSoon } from '@/lib/access';
import { loadCards, loadSite } from '@/lib/data';
import { loadProgress } from '@/lib/progress';

export const metadata = { title: 'حسابي', robots: { index: false } };

export default async function Account() {
  const [viewer, { topics, settings }] = await Promise.all([getViewer(), loadSite()]);
  if (!viewer.user) return (
    <div className="lock"><h3>👤 حسابك</h3><p>أنشئ حسابا بـ Gmail لتفتح كل المواضيع والمهن والامتحانات مجانا، وتحفظ تقدمك.</p><LoginButton label="الدخول بحساب Google" /></div>
  );
  const pk = topics.filter((t) => t.kind === 'package' && t.published);
  const [progress, cards] = await Promise.all([loadProgress(viewer.user.id), loadCards()]);
  const rows = progress.filter((r) => r.level > 0 && r.known.length).sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  return (<>
    <div className="hd"><div><h1>حسابي</h1><p>{viewer.user.email}</p></div></div>
    <div className="lbl"><h2>تقدمي</h2></div>
    {rows.length ? (
      <div className="grid">
        {rows.map((r) => {
          const t = topics.find((x) => x.id === r.topic_id);
          const total = cards.filter((c) => c.topic_id === r.topic_id && c.level === r.level).length || 1;
          return t && (
            <Link key={r.topic_id + r.level} href={`/topic/${t.id}?level=${r.level}`} className={`tile ${t.color}`}>
              <span className="e"><Emo e={t.emoji} size={44} /></span><b>{t.name}</b>
              <small>المستوى {r.level} · {r.known.length} من {total}</small>
              <span className="pbar"><i style={{ width: `${Math.round((r.known.length / total) * 100)}%` }} /></span>
            </Link>
          );
        })}
      </div>
    ) : <div className="empty">ابدأ أي موضوع، واضغط «أعرفها ✓» في البطاقات، فيظهر تقدمك هنا.</div>}
    <div className="lbl"><h2>الامتحانات الرسمية</h2></div>
    <div className="grid">
      {pk.map((t) => (
        <Link key={t.id} href={`/topic/${t.id}`} className={`tile ${t.color}`}>
          <span className="e"><Emo e={t.emoji} size={44} /></span><b>{t.name}</b><small>{isSoon(t, settings) ? '⏳ قريبا' : '✓ مفتوحة لك'}</small>
        </Link>
      ))}
    </div>
    {viewer.isAdmin && <Link className="btn dark" href="/admin" style={{ alignSelf: 'flex-start' }}>⚙️ لوحة التحكم</Link>}
    <form action="/auth/signout" method="post"><button className="btn ghost" type="submit">تسجيل الخروج</button></form>
  </>);
}
