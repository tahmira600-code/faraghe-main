import { Ok, TopicFilter } from '@/components/AdminBits';
import Recorder from '@/components/Recorder';
import { deleteCard, generateAudio, saveCard } from '../actions';
import { loadCards, loadSite } from '@/lib/data';
import { LEVELS, type Card, type Language, type Topic } from '@/lib/types';

function CardForm({ card, topics, languages, topicId }: { card?: Card; topics: Topic[]; languages: Language[]; topicId: string }) {
  return (
    <form action={saveCard} className="f">
      {card && <input type="hidden" name="id" value={card.id} />}
      <label>الإسبانية<input className="in es" name="es" defaultValue={card?.es} required dir="ltr" /></label>
      {languages.map((l) => (
        <label key={l.code}>{l.name}<input className="in" name={'tr_' + l.code} defaultValue={card?.tr[l.code]} dir={l.dir} /></label>
      ))}
      <div className="two">
        <label>الموضوع<select className="in" name="topic_id" defaultValue={card?.topic_id ?? topicId}>{topics.map((t) => <option key={t.id} value={t.id}>{t.emoji} {t.name}</option>)}</select></label>
        <label>المستوى<select className="in" name="level" defaultValue={card?.level ?? 1}>{[1, 2, 3].map((l) => <option key={l} value={l}>{LEVELS[l as 1].name}</option>)}</select></label>
      </div>
      <div className="three">
        <label>الصورة (إيموجي)<input className="in" name="emoji" defaultValue={card?.emoji} /></label>
        <label>القسم (للمهن)<input className="in" name="section" defaultValue={card?.section} placeholder="مثلا: السلامة" /></label>
        <label>الترتيب<input className="in" name="sort" type="number" defaultValue={card?.sort ?? 0} /></label>
      </div>
      <label>الصوت: سجّل بصوتك أو ارفع ملفا (اختياري)<input className="in" name="audio" type="file" accept="audio/*" /></label>
      <Recorder />
      {card?.audio_url && <label className="check"><input type="checkbox" name="clear_audio" /> حذف الصوت الحالي</label>}
      <button className="btn" type="submit">{card ? 'حفظ التعديل' : 'حفظ ونشر'}</button>
    </form>
  );
}

export default async function AdminCards({ searchParams }: { searchParams: Promise<{ topic?: string; ok?: string }> }) {
  const sp = await searchParams;
  const { topics, languages } = await loadSite();
  const topic = topics.find((t) => t.id === sp.topic) ?? topics[0];
  const cards = topic ? await loadCards([topic.id]) : [];
  return (<>
    <div className="hd"><div><h1>البطاقات</h1><p>كل بطاقة: الإسبانية، وترجمتها بكل لغة مفعّلة، وصورة، وصوت.</p></div></div>
    <Ok ok={sp.ok} />
    <TopicFilter topics={topics} current={topic?.id ?? ''} base="/admin/cards" />
    <div className="cols">
      <div className="box"><h2>{topic?.emoji} {topic?.name} ({cards.length})</h2>
        <div className="tbl"><table>
          <thead><tr><th></th><th>الإسبانية</th>{languages.map((l) => <th key={l.code}>{l.name}</th>)}<th>المستوى</th><th>صوت</th><th></th></tr></thead>
          <tbody>{cards.map((c) => (
            <tr key={c.id}>
              <td>{c.emoji}</td><td className="es">{c.es}{c.section && <><br /><small className="muted">{c.section}</small></>}</td>
              {languages.map((l) => <td key={l.code} dir={l.dir}>{c.tr[l.code] || <span className="danger">ناقصة</span>}</td>)}
              <td><span className="lv">{LEVELS[c.level as 1].name}</span></td>
              <td>{c.audio_url ? <audio src={c.audio_url} controls preload="none" style={{ width: 120, height: 32 }} /> : (
                <form action={generateAudio}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="topic_id" value={c.topic_id} /><button className="btn ghost small" type="submit">توليد</button></form>
              )}</td>
              <td>
                <details className="ed"><summary>تعديل</summary><CardForm card={c} topics={topics} languages={languages} topicId={topic.id} />
                  <form action={deleteCard} style={{ marginTop: 8 }}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="topic_id" value={c.topic_id} /><button className="danger" type="submit">حذف البطاقة</button></form>
                </details>
              </td>
            </tr>
          ))}</tbody>
        </table></div>
      </div>
      <div className="box"><h2>إضافة بطاقة</h2><CardForm topics={topics} languages={languages} topicId={topic?.id ?? ''} /></div>
    </div>
  </>);
}
