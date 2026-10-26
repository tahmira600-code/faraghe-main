import Link from 'next/link';
import { Ok } from '@/components/AdminBits';
import { resolveReport } from '../actions';
import { dbReady, loadSite } from '@/lib/data';
import { createAdminClient } from '@/lib/supabase/admin';

const KIND: Record<string, string> = { sound: '🔊 النطق', translation: '🌐 الترجمة', spanish: '✍️ الإسبانية', image: '🖼️ الصورة', other: '💬 أخرى' };
type R = { id: string; item_type: string; item_id: string; topic_id: string; item_text: string; kind: string; note: string; resolved: boolean; created_at: string };

// بلاغات مثال تظهر فقط في المعاينة المحلية
const SAMPLE: R[] = [
  { id: 's1', item_type: 'card', item_id: '', topic_id: 'agri', item_text: 'Ponte los guantes. = البس القفازات.', kind: 'sound', note: 'النطق سريع بزاف', resolved: false, created_at: new Date().toISOString() },
  { id: 's2', item_type: 'card', item_id: '', topic_id: 'hospital', item_text: 'la receta = الوصفة الطبية', kind: 'translation', note: '', resolved: false, created_at: new Date(Date.now() - 36e5).toISOString() },
  { id: 's3', item_type: 'question', item_id: '', topic_id: 'dgt', item_text: '¿Cuál es la velocidad máxima genérica de un turismo en autopista?', kind: 'other', note: 'الشرح غير واضح', resolved: false, created_at: new Date(Date.now() - 864e5).toISOString() },
];

export default async function AdminReports({ searchParams }: { searchParams: Promise<{ ok?: string; all?: string }> }) {
  const sp = await searchParams;
  const { topics } = await loadSite();
  let rows: R[] = SAMPLE;
  if (dbReady()) {
    let q = createAdminClient().from('reports').select('*').order('created_at', { ascending: false }).limit(200);
    if (!sp.all) q = q.eq('resolved', false);
    rows = ((await q).data ?? []) as R[];
  }
  const topic = (id: string) => topics.find((t) => t.id === id);
  return (<>
    <div className="hd"><div><h1>البلاغات</h1><p>ما أرسله الزوار عبر زر «هل هناك مشكلة؟».</p></div>
      <nav className="subs"><Link href="/admin/reports" aria-current={!sp.all}>المفتوحة</Link><Link href="/admin/reports?all=1" aria-current={!!sp.all}>الكل</Link></nav></div>
    <Ok ok={sp.ok} />
    <div className="box"><div className="tbl"><table>
      <thead><tr><th>متى</th><th>الموضوع</th><th>البطاقة أو السؤال</th><th>المشكلة</th><th>الملاحظة</th><th></th></tr></thead>
      <tbody>{rows.length ? rows.map((r) => {
        const t = topic(r.topic_id);
        return (
          <tr key={r.id} style={r.resolved ? { opacity: .5 } : undefined}>
            <td dir="ltr" style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{new Date(r.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</td>
            <td>{t ? `${t.emoji} ${t.name}` : r.topic_id}</td>
            <td><span dir="auto">{r.item_text}</span></td>
            <td><span className="lv">{KIND[r.kind] ?? r.kind}</span></td>
            <td>{r.note || <span className="muted">—</span>}</td>
            <td className="rowf">
              <Link className="btn ghost small" href={`/admin/${r.item_type === 'question' ? 'questions' : 'cards'}?topic=${r.topic_id}`}>تعديل</Link>
              {!r.resolved && <form action={resolveReport}><input type="hidden" name="id" value={r.id} /><button className="btn green small" type="submit">تم الإصلاح ✓</button></form>}
            </td>
          </tr>
        );
      }) : <tr><td colSpan={6} className="muted">لا توجد بلاغات مفتوحة 🎉</td></tr>}</tbody>
    </table></div></div>
  </>);
}
