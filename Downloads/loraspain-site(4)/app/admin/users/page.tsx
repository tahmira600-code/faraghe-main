import { dbReady, loadCards, loadSite } from '@/lib/data';
import { createAdminClient } from '@/lib/supabase/admin';
import type { ProgressRow } from '@/lib/progress';

type U = { id: string; email: string; name: string; created: string; last: string | null };

export default async function AdminUsers({ searchParams }: { searchParams: Promise<{ u?: string }> }) {
  const sp = await searchParams;
  const [{ topics }, cards] = await Promise.all([loadSite(), loadCards()]);
  let users: U[] = [];
  let progress: ProgressRow[] = [];
  let warn = '';
  if (dbReady()) {
    const d = createAdminClient();
    const [{ data: u }, p] = await Promise.all([
      d.auth.admin.listUsers({ page: 1, perPage: 1000 }),
      d.from('progress').select('*').range(0, 9999),
    ]);
    users = (u?.users ?? []).map((x) => ({
      id: x.id, email: x.email ?? '', name: String(x.user_metadata?.full_name || x.user_metadata?.name || ''),
      created: x.created_at, last: x.last_sign_in_at ?? null,
    })).sort((a, b) => (b.last ?? b.created).localeCompare(a.last ?? a.created));
    if (p.error) warn = 'جدول التقدم غير موجود بعد: الصق ملف supabase/progress.sql في SQL Editor ثم Run.';
    progress = (p.data ?? []) as ProgressRow[];
  }
  const name = (id: string) => (id === '_level' ? 'اختبار المستوى' : topics.find((t) => t.id === id)?.name ?? id);
  const mine = (id: string) => progress.filter((r) => r.user_id === id);
  const learned = (id: string) => mine(id).reduce((n, r) => n + (r.level > 0 ? r.known.length : 0), 0);
  const date = (s: string | null) => (s ? new Date(s).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '—');
  const since = (days: number) => users.filter((u) => u.last && Date.now() - +new Date(u.last) < days * 864e5).length;
  const sel = users.find((u) => u.id === sp.u);

  return (<>
    <div className="hd"><div><h1>المستخدمون</h1><p>كل من دخل إلى الموقع بحساب Google، وتقدمه.</p></div></div>
    {warn && <div className="warn">{warn}</div>}
    <div className="stats">
      <div className="st"><small>كل المستخدمين</small><b>{users.length}</b></div>
      <div className="st"><small>نشطون آخر 7 أيام</small><b>{since(7)}</b></div>
      <div className="st"><small>نشطون آخر 30 يوما</small><b>{since(30)}</b></div>
    </div>
    {sel && (
      <div className="box">
        <h2>{sel.name || sel.email}</h2>
        <p className="muted es" style={{ textAlign: 'right', margin: 0 }}>{sel.email}</p>
        <p>سجّل في {date(sel.created)} · آخر دخول {date(sel.last)} · تعلّم {learned(sel.id)} كلمة</p>
        <div className="tbl"><table>
          <thead><tr><th>الموضوع</th><th>المستوى</th><th>تعلّم</th><th>أحسن نتيجة</th><th>آخر نشاط</th></tr></thead>
          <tbody>{mine(sel.id).length ? mine(sel.id).map((r) => {
            const total = cards.filter((c) => c.topic_id === r.topic_id && c.level === r.level).length;
            return (
              <tr key={r.topic_id + r.level}>
                <td>{name(r.topic_id)}</td><td>{r.level}</td><td>{r.known.length ? `${r.known.length} / ${total}` : '—'}</td>
                <td dir="ltr" style={{ textAlign: 'right' }}>{r.quiz_best != null ? `${r.quiz_best} / ${r.quiz_total}` : '—'}</td>
                <td dir="ltr" style={{ textAlign: 'right' }}>{date(r.updated_at)}</td>
              </tr>
            );
          }) : <tr><td colSpan={5} className="muted">لم يبدأ بعد.</td></tr>}</tbody>
        </table></div>
      </div>
    )}
    <div className="box"><div className="tbl"><table>
      <thead><tr><th>المستخدم</th><th>التسجيل</th><th>آخر دخول</th><th>تعلّم</th><th>اختبارات</th></tr></thead>
      <tbody>{users.length ? users.map((u) => (
        <tr key={u.id}>
          <td><a href={`/admin/users?u=${u.id}`}><b>{u.name || '—'}</b><br /><small className="muted es">{u.email}</small></a></td>
          <td dir="ltr" style={{ textAlign: 'right' }}>{date(u.created)}</td>
          <td dir="ltr" style={{ textAlign: 'right' }}>{date(u.last)}</td>
          <td>{learned(u.id)}</td>
          <td>{mine(u.id).filter((r) => r.quiz_best != null).length}</td>
        </tr>
      )) : <tr><td colSpan={5} className="muted">لا يوجد مستخدمون بعد.</td></tr>}</tbody>
    </table></div></div>
  </>);
}
