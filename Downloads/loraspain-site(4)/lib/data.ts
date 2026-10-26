import 'server-only';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { cookies } from 'next/headers';
import { createAdminClient } from './supabase/admin';
import { supabaseConfigured } from './supabase/config';
import { SEED_CARDS, SEED_LANGUAGES, SEED_QUESTIONS, SEED_SETTINGS, SEED_TOPICS } from './seed';
import type { Card, Language, Question, Settings, Topic } from './types';

// المحتوى يُقرأ من الخادم فقط (بمفتاح service role)، حتى لا يصل المحتوى المقفل إلى المتصفح
export const dbReady = () => supabaseConfigured && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

const seedCards: Card[] = SEED_CARDS.map((c, i) => ({ ...c, id: 'seed-' + i }));
const seedQuestions: Question[] = SEED_QUESTIONS.map((q, i) => ({ ...q, id: 'seedq-' + i }));

// المحتوى يُحفظ في ذاكرة الخادم حتى يغيّره المدير (revalidateTag('content'))، فلا نسأل قاعدة البيانات في كل زيارة
const TAG = { tags: ['content'], revalidate: 3600 };

const siteFromDb = unstable_cache(async () => {
    const db = createAdminClient();
    const [l, t, s] = await Promise.all([
      db.from('languages').select('*').order('sort'),
      db.from('topics').select('*').order('sort'),
      db.from('settings').select('*'),
    ]);
    if (l.data?.length) {
      const settings = { ...SEED_SETTINGS } as Settings;
      // المفاتيح السرية (مثل مفتاح Google TTS) لا تخرج من هنا أبدا
      for (const row of s.data ?? []) if (!row.key.startsWith('secret_')) (settings as Record<string, string>)[row.key] = row.value;
      return { seeded: true, languages: l.data as Language[], topics: (t.data ?? []) as Topic[], settings };
    }
    return null;
}, ['site'], TAG);

// الموقع مجاني بالكامل: لا توجد باقات مدفوعة. ما كان «مدفوعا» في قاعدة البيانات يُفتح بحساب Google مثل الباقي، و«Pro» لم يعد موجودا
const freeTopics = (topics: Topic[]): Topic[] =>
  topics.filter((t) => t.id !== 'pro').map((t) => (t.tier === 'paid' ? { ...t, tier: 'account', price_cents: 0 } : t));

export const loadSite = cache(async () => {
  if (dbReady()) {
    const site = await siteFromDb();
    if (site) return { ...site, topics: freeTopics(site.topics) };
  }
  return { seeded: false, languages: SEED_LANGUAGES, topics: freeTopics(SEED_TOPICS), settings: SEED_SETTINGS };
});

// كل البطاقات مرة واحدة (بالصفحات، لأن Supabase يرجع 1000 صف كحد أقصى)
const allCards = unstable_cache(async (): Promise<Card[]> => {
  const db = createAdminClient();
  const out: Card[] = [];
  for (let from = 0; ; from += 1000) {
    const { data } = await db.from('cards').select('*').order('sort').order('id').range(from, from + 999);
    out.push(...((data ?? []) as Card[]));
    if (!data || data.length < 1000) break;
  }
  return out;
}, ['cards'], TAG);

const allQuestions = unstable_cache(async (): Promise<Question[]> => {
  const { data } = await createAdminClient().from('questions').select('*').order('sort').range(0, 4999);
  return (data ?? []) as Question[];
}, ['questions'], TAG);

export const loadCards = cache(async (topicIds?: string[]): Promise<Card[]> => {
  const { seeded } = await loadSite();
  const list = seeded ? await allCards() : seedCards;
  return topicIds ? list.filter((c) => topicIds.includes(c.topic_id)) : list;
});

export const loadQuestions = cache(async (topicId: string): Promise<Question[]> => {
  const { seeded } = await loadSite();
  return (seeded ? await allQuestions() : seedQuestions).filter((q) => q.topic_id === topicId);
});

// لغة الترجمة التي اختارها الزائر (العربية افتراضيا)
export async function currentLang(languages: Language[]) {
  const c = (await cookies()).get('lang')?.value;
  const enabled = languages.filter((l) => l.enabled);
  return enabled.find((l) => l.code === c) ?? enabled.find((l) => l.code === 'ar') ?? enabled[0] ?? SEED_LANGUAGES[0];
}


export const tr = (map: Record<string, string> | undefined, code: string) => map?.[code] || map?.ar || Object.values(map ?? {})[0] || '';
