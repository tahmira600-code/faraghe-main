import { Ok } from '@/components/AdminBits';
import { deleteLanguage, saveLanguage } from '../actions';
import { loadSite } from '@/lib/data';
import type { Language } from '@/lib/types';

function LangForm({ l }: { l?: Language }) {
  return (
    <form action={saveLanguage} className="f">
      <div className="two">
        <label>الرمز{l ? <><input type="hidden" name="code" value={l.code} /><input className="in" value={l.code} disabled /></> : <input className="in" name="code" required dir="ltr" placeholder="fr أو ary للدارجة" />}</label>
        <label>الاسم<input className="in" name="name" defaultValue={l?.name} required placeholder="الفرنسية" /></label>
      </div>
      <div className="two">
        <label>اتجاه الكتابة<select className="in" name="dir" defaultValue={l?.dir ?? 'rtl'}><option value="rtl">من اليمين (عربية)</option><option value="ltr">من اليسار (فرنسية، إنجليزية…)</option></select></label>
        <label>الترتيب<input className="in" name="sort" type="number" defaultValue={l?.sort ?? 1} /></label>
      </div>
      <label className="check"><input type="checkbox" name="enabled" defaultChecked={l?.enabled ?? true} /> مفعّلة (يختارها الزوار)</label>
      <button className="btn" type="submit">{l ? 'حفظ' : 'إضافة اللغة'}</button>
    </form>
  );
}

export default async function AdminLanguages({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const { ok } = await searchParams;
  const { languages } = await loadSite();
  return (<>
    <div className="hd"><div><h1>لغات الترجمة</h1><p>كل لغة تضيفها تظهر لها خانة في كل بطاقة وسؤال. وعندما تكون أكثر من لغة، يختار الزائر لغته من القائمة.</p></div></div>
    <Ok ok={ok} />
    <div className="cols">
      <div className="box"><div className="tbl"><table>
        <thead><tr><th>اللغة</th><th>الرمز</th><th>الحالة</th><th></th></tr></thead>
        <tbody>{languages.map((l) => (
          <tr key={l.code}><td>{l.name}</td><td className="es">{l.code}</td><td>{l.enabled ? 'مفعّلة' : 'موقوفة'}</td>
            <td><details className="ed"><summary>تعديل</summary><LangForm l={l} />
              <form action={deleteLanguage} style={{ marginTop: 8 }}><input type="hidden" name="code" value={l.code} /><button className="danger" type="submit">حذف اللغة</button></form>
            </details></td></tr>
        ))}</tbody>
      </table></div></div>
      <div className="box"><h2>إضافة لغة</h2><LangForm /></div>
    </div>
  </>);
}
