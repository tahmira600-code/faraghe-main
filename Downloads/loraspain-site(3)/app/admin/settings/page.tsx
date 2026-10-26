import { Ok } from '@/components/AdminBits';
import { generateAudio, saveSettings } from '../actions';
import { dbReady, loadCards, loadSite } from '@/lib/data';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function AdminSettings({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const { ok } = await searchParams;
  const { settings, topics } = await loadSite();
  const soon = (settings.soon_topics ?? '').split(',');
  const cards = await loadCards();
  let hasKey = !!process.env.GOOGLE_TTS_API_KEY, voice = '';
  if (dbReady()) {
    const { data } = await createAdminClient().from('settings').select('key, value').in('key', ['secret_google_tts_key', 'tts_voice']);
    hasKey ||= !!data?.some((r) => r.key === 'secret_google_tts_key');
    voice = data?.find((r) => r.key === 'tts_voice')?.value ?? '';
  }
  const missing = cards.filter((c) => !c.audio_url).length;
  return (<>
    <div className="hd"><div><h1>الإعدادات والصوت</h1><p>نصوص الصفحة الرئيسية، وتشغيل الصوت، ومفتاح Google للنطق.</p></div></div>
    <Ok ok={ok} />
    <div className="cols">
      <form action={saveSettings} className="box f">
        <h2>الإعدادات</h2>
        <label>عنوان الصفحة الرئيسية (للزوار)<input className="in" name="hero_title" defaultValue={settings.hero_title} /></label>
        <label>النص تحت العنوان<textarea className="in" name="hero_subtitle" defaultValue={settings.hero_subtitle} /></label>
        <label className="check"><input type="checkbox" name="sound_enabled" defaultChecked={settings.sound_enabled !== '0'} /> 🔊 تشغيل الصوت في الموقع</label>
        <p className="muted" style={{ margin: 0 }}>⏳ «قريبا»: الباقة تظهر للزوار مقفلة حتى يجهز محتواها. أزل العلامة لما تجهز.</p>
        {topics.filter((t) => t.kind === 'package').map((t) => (
          <label key={t.id} className="check"><input type="checkbox" name="soon" value={t.id} defaultChecked={soon.includes(t.id)} /> {t.emoji} {t.name}: قريبا</label>
        ))}
        <h2 style={{ marginTop: 10 }}>مفتاح Google Text-to-Speech</h2>
        <p className="muted" style={{ margin: 0 }}>{hasKey ? '✓ المفتاح محفوظ. لا يظهر هنا لأنه سري. اكتب مفتاحا جديدا فقط إذا أردت تغييره.' : 'لا يوجد مفتاح بعد. الدليل يشرح كيف تحصل عليه.'}</p>
        <label>المفتاح<input className="in" name="secret_google_tts_key" type="password" autoComplete="off" dir="ltr" placeholder={hasKey ? '••••••••' : 'AIza...'} /></label>
        {hasKey && <label className="check"><input type="checkbox" name="remove_key" /> حذف المفتاح المحفوظ</label>}
        <label>اسم الصوت (اختياري، مثلا es-ES-Neural2-A)<input className="in" name="tts_voice" defaultValue={voice} dir="ltr" /></label>
        <button className="btn" type="submit">حفظ الإعدادات</button>
      </form>
      <div className="box f">
        <h2>🔊 توليد الصوت</h2>
        <p style={{ margin: 0 }}>{missing ? `${missing} بطاقة بدون ملف صوت.` : 'كل البطاقات لها ملف صوت ✓'}</p>
        <p className="muted" style={{ margin: 0 }}>كل ضغطة تولّد الصوت لـ 25 بطاقة. اضغط مرة أخرى حتى يصير العدد صفرا. الملفات تُحفظ في Supabase وتُسمع بنفس الجودة على كل الأجهزة.</p>
        <form action={generateAudio}><button className="btn green" type="submit" disabled={!hasKey || !missing}>توليد الصوت للبطاقات الناقصة</button></form>
      </div>
    </div>
  </>);
}
