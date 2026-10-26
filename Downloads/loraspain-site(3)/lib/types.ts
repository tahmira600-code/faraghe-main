export type Level = 1 | 2 | 3;
// 'paid' بقي فقط لأن صفوفا قديمة في قاعدة البيانات قد تحمله؛ loadSite يحوّله إلى 'account'
export type Tier = 'free' | 'account' | 'paid';
export type Kind = 'topic' | 'job' | 'package';

export type Language = { code: string; name: string; dir: 'rtl' | 'ltr'; sort: number; enabled: boolean };
export type Topic = {
  id: string; kind: Kind; name: string; name_es: string; emoji: string; color: string;
  tier: Tier; price_cents: number; blurb: string; sort: number; published: boolean;
};
// tr: الترجمة لكل لغة، مثلا { ar: 'الماء', fr: "l'eau" }
export type SeedCard = { topic_id: string; level: Level | number; emoji: string; es: string; tr: Record<string, string>; section: string; sort: number; audio_url?: string };
export type Card = SeedCard & { id: string };
export type SeedQuestion = {
  topic_id: string; level: Level | number; q: string; options: string[]; answer: number;
  tr: Record<string, { q: string; exp: string; options?: string[] }>; sort: number;
};
export type Question = SeedQuestion & { id: string };
export type Settings = { hero_title: string; hero_subtitle: string; sound_enabled: string; soon_topics: string };

export const LEVELS: Record<Level, { name: string; es: string }> = {
  1: { name: 'مبتدئ', es: 'Principiante' },
  2: { name: 'متوسط', es: 'Intermedio' },
  3: { name: 'متقدم', es: 'Avanzado' },
};
export const parseLevel = (v: unknown): Level => (String(v) === '2' ? 2 : String(v) === '3' ? 3 : 1);
export const COLORS = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7'];
