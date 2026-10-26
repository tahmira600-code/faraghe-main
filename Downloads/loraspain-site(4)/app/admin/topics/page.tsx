import { Ok } from '@/components/AdminBits';
import { deleteTopic, saveTopic } from '../actions';
import { loadSite } from '@/lib/data';
import { COLORS, type Topic } from '@/lib/types';

const KIND = { topic: 'موضوع', job: 'مهنة', package: 'باقة' };
const TIER = { free: 'مجاني للجميع', account: 'مجاني بحساب Google' };

function TopicForm({ t }: { t?: Topic }) {
  return (
    <form action={saveTopic} className="f">
      <div className="two">
        <label>المعرّف (بالإنجليزية، بدون مسافات){t ? <><input type="hidden" name="id" value={t.id} /><input className="in" value={t.id} disabled /></> : <input className="in" name="id" required dir="ltr" placeholder="construction" />}</label>
        <label>النوع<select className="in" name="kind" defaultValue={t?.kind ?? 'topic'}>{Object.entries(KIND).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
      </div>
      <div className="two">
        <label>الاسم<input className="in" name="name" defaultValue={t?.name} required /></label>
        <label>الاسم بالإسبانية<input className="in" name="name_es" defaultValue={t?.name_es} dir="ltr" /></label>
      </div>
      <div className="three">
        <label>الإيموجي<input className="in" name="emoji" defaultValue={t?.emoji} /></label>
        <label>اللون<select className="in" name="color" defaultValue={t?.color ?? 'c1'}>{COLORS.map((c) => <option key={c} value={c}>{c}</option>)}</select></label>
        <label>الترتيب<input className="in" name="sort" type="number" defaultValue={t?.sort ?? 0} /></label>
      </div>
      <label>من يستطيع الدخول<select className="in" name="tier" defaultValue={t?.tier === 'free' ? 'free' : t ? 'account' : 'free'}>{Object.entries(TIER).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
      <label>وصف قصير<input className="in" name="blurb" defaultValue={t?.blurb} /></label>
      <label className="check"><input type="checkbox" name="published" defaultChecked={t?.published ?? true} /> ظاهر في الموقع</label>
      <button className="btn" type="submit">{t ? 'حفظ التعديل' : 'إضافة'}</button>
    </form>
  );
}

export default async function AdminTopics({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const { ok } = await searchParams;
  const { topics } = await loadSite();
  return (<>
    <div className="hd"><div><h1>المواضيع والمهن</h1><p>كل شيء مجاني. من هنا تحدد ما هو مفتوح للجميع، وما يحتاج حساب Google.</p></div></div>
    <Ok ok={ok} />
    <div className="cols">
      <div className="box"><div className="tbl"><table>
        <thead><tr><th></th><th>الاسم</th><th>النوع</th><th>الدخول</th><th>ظاهر</th><th></th></tr></thead>
        <tbody>{topics.map((t) => (
          <tr key={t.id}>
            <td><span className={`chip ${t.color}`}>{t.emoji}</span></td><td>{t.name}<br /><small className="muted es">{t.id}</small></td>
            <td>{KIND[t.kind]}</td><td>{TIER[t.tier === 'free' ? 'free' : 'account']}</td><td>{t.published ? '✓' : '—'}</td>
            <td><details className="ed"><summary>تعديل</summary><TopicForm t={t} />
              <form action={deleteTopic} style={{ marginTop: 8 }}><input type="hidden" name="id" value={t.id} /><button className="danger" type="submit">حذف الموضوع وكل بطاقاته</button></form>
            </details></td>
          </tr>
        ))}</tbody>
      </table></div></div>
      <div className="box"><h2>إضافة موضوع أو مهنة أو باقة</h2><TopicForm /></div>
    </div>
  </>);
}
