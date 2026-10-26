'use server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { dbReady, loadSite } from '@/lib/data';
import { SEED_CARDS, SEED_LANGUAGES, SEED_QUESTIONS, SEED_SETTINGS, SEED_TOPICS } from '@/lib/seed';

async function db() {
  const a = await requireAdmin();
  if (a.preview || !dbReady()) throw new Error('قاعدة البيانات غير مربوطة بعد.');
  return createAdminClient();
}
const str = (f: FormData, k: string) => String(f.get(k) ?? '').trim();
const num = (f: FormData, k: string, d = 0) => { const n = Number(f.get(k)); return Number.isFinite(n) ? n : d; };
const done = (path: string, msg = 'saved') => { revalidateTag('content'); revalidatePath('/', 'layout'); redirect(`${path}${path.includes('?') ? '&' : '?'}ok=${msg}`); };
const check = (e: { message: string } | null) => { if (e) throw new Error(e.message); };

// ---------- المحتوى الأولي ----------
// يضيف فقط ما ليس موجودا (مواضيع، بطاقات، أسئلة)، ولا يغيّر ما عدّلته أنت
export async function importSeed() {
  const d = await db();
  check((await d.from('languages').upsert(SEED_LANGUAGES, { onConflict: 'code', ignoreDuplicates: true })).error);
  check((await d.from('topics').upsert(SEED_TOPICS, { onConflict: 'id', ignoreDuplicates: true })).error);
  const have = new Set<string>();
  for (let from = 0; ; from += 1000) {
    const { data, error } = await d.from('cards').select('topic_id, es').range(from, from + 999);
    check(error);
    data?.forEach((c) => have.add(c.topic_id + '|' + c.es.trim().toLowerCase()));
    if (!data || data.length < 1000) break;
  }
  const cards = SEED_CARDS.filter((c) => !have.has(c.topic_id + '|' + c.es.trim().toLowerCase()));
  for (let i = 0; i < cards.length; i += 500) check((await d.from('cards').insert(cards.slice(i, i + 500))).error);
  const { data: qs, error } = await d.from('questions').select('topic_id, q').range(0, 9999);
  check(error);
  const haveQ = new Set((qs ?? []).map((q) => q.topic_id + '|' + q.q.trim().toLowerCase()));
  const questions = SEED_QUESTIONS.filter((q) => !haveQ.has(q.topic_id + '|' + q.q.trim().toLowerCase()));
  for (let i = 0; i < questions.length; i += 500) check((await d.from('questions').insert(questions.slice(i, i + 500))).error);
  check((await d.from('settings').upsert(Object.entries(SEED_SETTINGS).map(([key, value]) => ({ key, value })), { ignoreDuplicates: true })).error);
  done('/admin', 'imported');
}

// ---------- اللغات ----------
export async function saveLanguage(f: FormData) {
  const code = str(f, 'code').toLowerCase().replace(/[^a-z-]/g, '');
  if (!code || !str(f, 'name')) throw new Error('الرمز والاسم مطلوبان');
  check((await (await db()).from('languages').upsert({ code, name: str(f, 'name'), dir: str(f, 'dir') === 'ltr' ? 'ltr' : 'rtl', sort: num(f, 'sort'), enabled: f.get('enabled') === 'on' })).error);
  done('/admin/languages');
}
export async function deleteLanguage(f: FormData) {
  const d = await db();
  const { count } = await d.from('languages').select('code', { count: 'exact', head: true });
  if ((count ?? 0) <= 1) throw new Error('يجب أن تبقى لغة واحدة على الأقل');
  check((await d.from('languages').delete().eq('code', str(f, 'code'))).error);
  done('/admin/languages', 'deleted');
}

// ---------- المواضيع والمهن والباقات (كلها مجانية) ----------
export async function saveTopic(f: FormData) {
  const id = str(f, 'id').toLowerCase().replace(/[^a-z0-9-]/g, '');
  if (!id || !str(f, 'name')) throw new Error('المعرّف والاسم مطلوبان');
  const tier = ['free', 'account'].includes(str(f, 'tier')) ? str(f, 'tier') : 'free';
  check((await (await db()).from('topics').upsert({
    id, name: str(f, 'name'), name_es: str(f, 'name_es'), emoji: str(f, 'emoji') || '📘', color: str(f, 'color') || 'c1',
    kind: ['topic', 'job', 'package'].includes(str(f, 'kind')) ? str(f, 'kind') : 'topic', tier,
    price_cents: 0, blurb: str(f, 'blurb'), sort: num(f, 'sort'), published: f.get('published') === 'on',
  })).error);
  done('/admin/topics');
}
export async function deleteTopic(f: FormData) {
  check((await (await db()).from('topics').delete().eq('id', str(f, 'id'))).error);
  done('/admin/topics', 'deleted');
}

// ---------- البطاقات ----------
async function uploadAudio(file: File, name: string) {
  const d = await db();
  const path = `${name}-${Date.now()}.${file.name.split('.').pop() || 'mp3'}`;
  check((await d.storage.from('audio').upload(path, file, { contentType: file.type || 'audio/mpeg', upsert: true })).error);
  return d.storage.from('audio').getPublicUrl(path).data.publicUrl;
}
export async function saveCard(f: FormData) {
  const d = await db();
  const { languages } = await loadSite();
  const tr: Record<string, string> = {};
  for (const l of languages) { const v = str(f, 'tr_' + l.code); if (v) tr[l.code] = v; }
  const row: Record<string, unknown> = {
    topic_id: str(f, 'topic_id'), level: Math.min(3, Math.max(1, num(f, 'level', 1))), emoji: str(f, 'emoji'),
    es: str(f, 'es'), tr, section: str(f, 'section'), sort: num(f, 'sort'),
  };
  if (!row.es || !row.topic_id) throw new Error('النص الإسباني والموضوع مطلوبان');
  const id = str(f, 'id');
  const audio = f.get('audio');
  if (audio instanceof File && audio.size > 0) row.audio_url = await uploadAudio(audio, id || 'card');
  if (f.get('clear_audio') === 'on') row.audio_url = null;
  if (id) check((await d.from('cards').update(row).eq('id', id)).error);
  else check((await d.from('cards').insert(row)).error);
  done(`/admin/cards?topic=${row.topic_id}`);
}
export async function deleteCard(f: FormData) {
  check((await (await db()).from('cards').delete().eq('id', str(f, 'id'))).error);
  done(`/admin/cards?topic=${str(f, 'topic_id')}`, 'deleted');
}

// ---------- الأسئلة ----------
export async function saveQuestion(f: FormData) {
  const d = await db();
  const { languages } = await loadSite();
  const options = str(f, 'options').split('\n').map((s) => s.trim()).filter(Boolean);
  const answer = num(f, 'answer', 1) - 1;
  if (!str(f, 'q') || options.length < 2 || answer < 0 || answer >= options.length) throw new Error('السؤال، واختياران على الأقل، ورقم جواب صحيح مطلوبة');
  const tr: Record<string, { q: string; exp: string }> = {};
  for (const l of languages) { const q = str(f, 'trq_' + l.code), exp = str(f, 'tre_' + l.code); if (q || exp) tr[l.code] = { q, exp }; }
  const row = { topic_id: str(f, 'topic_id'), level: num(f, 'level', 1), q: str(f, 'q'), options, answer, tr, sort: num(f, 'sort') };
  const id = str(f, 'id');
  if (id) check((await d.from('questions').update(row).eq('id', id)).error);
  else check((await d.from('questions').insert(row)).error);
  done(`/admin/questions?topic=${row.topic_id}`);
}
export async function deleteQuestion(f: FormData) {
  check((await (await db()).from('questions').delete().eq('id', str(f, 'id'))).error);
  done(`/admin/questions?topic=${str(f, 'topic_id')}`, 'deleted');
}

// ---------- الإعدادات والصوت ----------
export async function saveSettings(f: FormData) {
  const d = await db();
  const rows = [
    { key: 'hero_title', value: str(f, 'hero_title') },
    { key: 'hero_subtitle', value: str(f, 'hero_subtitle') },
    { key: 'sound_enabled', value: f.get('sound_enabled') === 'on' ? '1' : '0' },
    { key: 'soon_topics', value: f.getAll('soon').map(String).join(',') },
    { key: 'tts_voice', value: str(f, 'tts_voice') },
  ];
  const key = str(f, 'secret_google_tts_key');
  if (key) rows.push({ key: 'secret_google_tts_key', value: key });
  if (f.get('remove_key') === 'on') check((await d.from('settings').delete().eq('key', 'secret_google_tts_key')).error);
  check((await d.from('settings').upsert(rows)).error);
  done('/admin/settings');
}

// يولّد ملفات الصوت عبر Google Text-to-Speech، 25 بطاقة في كل ضغطة
export async function generateAudio(f: FormData) {
  const d = await db();
  const { data: s } = await d.from('settings').select('*').in('key', ['secret_google_tts_key', 'tts_voice']);
  const key = s?.find((r) => r.key === 'secret_google_tts_key')?.value || process.env.GOOGLE_TTS_API_KEY;
  const voice = s?.find((r) => r.key === 'tts_voice')?.value;
  if (!key) throw new Error('أضف مفتاح Google Text-to-Speech أولا');
  const one = str(f, 'id');
  let q = d.from('cards').select('id, es, topic_id');
  q = one ? q.eq('id', one) : q.is('audio_url', null).limit(25);
  const { data: cards } = await q;
  for (const c of cards ?? []) {
    const r = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(key)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text: c.es },
        voice: voice ? { languageCode: 'es-ES', name: voice } : { languageCode: 'es-ES', ssmlGender: 'FEMALE' },
        audioConfig: { audioEncoding: 'MP3', speakingRate: 0.95 },
      }),
    });
    const j = await r.json();
    if (!r.ok) throw new Error('Google TTS: ' + (j.error?.message ?? r.status));
    const path = `tts/${c.id}-${Date.now()}.mp3`;
    check((await d.storage.from('audio').upload(path, Buffer.from(j.audioContent, 'base64'), { contentType: 'audio/mpeg', upsert: true })).error);
    check((await d.from('cards').update({ audio_url: d.storage.from('audio').getPublicUrl(path).data.publicUrl }).eq('id', c.id)).error);
  }
  done(one ? `/admin/cards?topic=${str(f, 'topic_id')}` : '/admin/settings', `audio${cards?.length ?? 0}`);
}

// ---------- البلاغات ----------
export async function resolveReport(f: FormData) {
  check((await (await db()).from('reports').update({ resolved: true }).eq('id', str(f, 'id'))).error);
  done('/admin/reports', 'saved');
}
