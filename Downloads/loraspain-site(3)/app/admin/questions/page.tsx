import { Ok, TopicFilter } from '@/components/AdminBits';
import { deleteQuestion, saveQuestion } from '../actions';
import { loadQuestions, loadSite } from '@/lib/data';
import type { Language, Question, Topic } from '@/lib/types';

function QForm({ q, topics, languages, topicId }: { q?: Question; topics: Topic[]; languages: Language[]; topicId: string }) {
  return (
    <form action={saveQuestion} className="f">
      {q && <input type="hidden" name="id" value={q.id} />}
      <label>السؤال بالإسبانية<textarea className="in" name="q" defaultValue={q?.q} required dir="ltr" /></label>
      <label>الاختيارات (كل اختيار في سطر)<textarea className="in" name="options" defaultValue={q?.options.join('\n')} required dir="ltr" /></label>
      <div className="three">
        <label>رقم الجواب الصحيح<input className="in" name="answer" type="number" min={1} defaultValue={(q?.answer ?? 0) + 1} /></label>
        <label>الموضوع<select className="in" name="topic_id" defaultValue={q?.topic_id ?? topicId}>{topics.map((t) => <option key={t.id} value={t.id}>{t.emoji} {t.name}</option>)}</select></label>
        <label>الترتيب<input className="in" name="sort" type="number" defaultValue={q?.sort ?? 0} /></label>
      </div>
      {languages.map((l) => (
        <div key={l.code} className="two">
          <label>السؤال ب{l.name}<input className="in" name={'trq_' + l.code} defaultValue={q?.tr[l.code]?.q} dir={l.dir} /></label>
          <label>الشرح ب{l.name}<input className="in" name={'tre_' + l.code} defaultValue={q?.tr[l.code]?.exp} dir={l.dir} /></label>
        </div>
      ))}
      <input type="hidden" name="level" value={q?.level ?? 1} />
      <button className="btn" type="submit">{q ? 'حفظ التعديل' : 'حفظ ونشر'}</button>
    </form>
  );
}

export default async function AdminQuestions({ searchParams }: { searchParams: Promise<{ topic?: string; ok?: string }> }) {
  const sp = await searchParams;
  const { topics, languages } = await loadSite();
  const topic = topics.find((t) => t.id === sp.topic) ?? topics.find((t) => t.kind === 'package') ?? topics[0];
  const qs = topic ? await loadQuestions(topic.id) : [];
  return (<>
    <div className="hd"><div><h1>الأسئلة</h1><p>أسئلة الاختيار من متعدد، مع ترجمة السؤال وشرح الجواب.</p></div></div>
    <Ok ok={sp.ok} />
    <TopicFilter topics={topics} current={topic?.id ?? ''} base="/admin/questions" />
    <div className="cols">
      <div className="box"><h2>{topic?.emoji} {topic?.name} ({qs.length})</h2>
        <div className="tbl"><table>
          <thead><tr><th>#</th><th>السؤال</th><th>الجواب</th><th></th></tr></thead>
          <tbody>{qs.map((q, n) => (
            <tr key={q.id}>
              <td>{n + 1}</td><td><span className="es" dir="ltr">{q.q}</span><br /><small className="muted">{q.tr.ar?.q}</small></td>
              <td className="es">{q.options[q.answer]}</td>
              <td><details className="ed"><summary>تعديل</summary><QForm q={q} topics={topics} languages={languages} topicId={topic.id} />
                <form action={deleteQuestion} style={{ marginTop: 8 }}><input type="hidden" name="id" value={q.id} /><input type="hidden" name="topic_id" value={q.topic_id} /><button className="danger" type="submit">حذف السؤال</button></form>
              </details></td>
            </tr>
          ))}</tbody>
        </table></div>
      </div>
      <div className="box"><h2>إضافة سؤال</h2><QForm topics={topics} languages={languages} topicId={topic?.id ?? ''} /></div>
    </div>
  </>);
}
