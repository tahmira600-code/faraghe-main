import 'server-only';
import { dbReady } from './data';
import { createAdminClient } from './supabase/admin';

export type ProgressRow = { user_id: string; topic_id: string; level: number; known: string[]; quiz_best: number | null; quiz_total: number | null; updated_at: string };

export async function loadProgress(userId?: string | null): Promise<ProgressRow[]> {
  if (!userId || !dbReady()) return [];
  const { data } = await createAdminClient().from('progress').select('*').eq('user_id', userId);
  return (data ?? []) as ProgressRow[];
}

export const knownFor = (rows: ProgressRow[], topic: string) =>
  new Set(rows.filter((r) => r.topic_id === topic && r.level > 0).flatMap((r) => r.known));
