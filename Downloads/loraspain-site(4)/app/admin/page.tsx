import Link from 'next/link';
import { Ok } from '@/components/AdminBits';
import { importSeed } from './actions';
import { dbReady, loadCards, loadSite } from '@/lib/data';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const { ok } = await searchParams;
  const { seeded, topics, languages } = await loadSite();
  const cards = await loadCards();
  let users = 0, reports = 0;
  if (dbReady()) {
    const d = createAdminClient();
    const { data: u } = await d.auth.admin.listUsers({ page: 1, perPage: 1000 });
    users = u?.users.length ?? 0;
    reports = (await d.from('reports').select('id', { count: 'exact', head: true }).eq('resolved', false)).count ?? 0;
  }
  const noAudio = cards.filter((c) => !c.audio_url).length;
  return (<>
    <div className="hd"><div><h1>نظرة عامة</h1><p>كل ما تغيّره هنا يظهر مباشرة في الموقع.</p></div></div>
    <Ok ok={ok} />
    {dbReady() && !seeded && (
      <div className="lock"><h3>ابدأ باستيراد المحتوى الأولي</h3>
        <p>قاعدة البيانات فارغة. اضغط هنا لنقل كل البطاقات والأسئلة والمواضيع الجاهزة إليها، ثم عدّلها كما تريد.</p>
        <form action={importSeed}><button className="btn" type="submit">استيراد المحتوى الأولي</button></form></div>
    )}
    <div className="stats">
      <div className="st"><small>المستخدمون</small><b>{users}</b></div>
      <div className="st"><small>البطاقات</small><b>{cards.length}</b></div>
      <div className="st"><small>المواضيع والمهن</small><b>{topics.length}</b></div>
      <div className="st"><small>لغات الترجمة</small><b>{languages.length}</b></div>
    </div>
    {reports > 0 && <div className="warn">⚑ عندك {reports} بلاغ مفتوح من الزوار. <Link href="/admin/reports" style={{ textDecoration: 'underline' }}>اعرضها</Link>.</div>}
    {noAudio > 0 && <div className="warn">🔊 {noAudio} بطاقة بدون ملف صوت. <Link href="/admin/settings" style={{ textDecoration: 'underline' }}>ولّد الصوت من الإعدادات</Link>.</div>}
    <div className="grid">
      <Link className="tile c1" href="/admin/cards"><span className="e">🃏</span><b>أضف بطاقة</b><small>كلمة أو جملة جديدة</small></Link>
      <Link className="tile c3" href="/admin/questions"><span className="e">🏆</span><b>أضف سؤالا</b><small>لرخصة السياقة أو الجنسية</small></Link>
      <Link className="tile c2" href="/admin/topics"><span className="e">🌾</span><b>موضوع أو مهنة</b><small>ومن يستطيع فتحه</small></Link>
      <Link className="tile c5" href="/admin/languages"><span className="e">🌐</span><b>لغة ترجمة جديدة</b><small>مثلا الفرنسية</small></Link>
    </div>
  </>);
}
