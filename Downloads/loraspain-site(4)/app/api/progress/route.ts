import { NextResponse } from 'next/server';
import { getViewer } from '@/lib/access';
import { dbReady } from '@/lib/data';
import { createAdminClient } from '@/lib/supabase/admin';

// يحفظ تقدم المستخدم المسجل: بطاقات عرفها، أو نتيجة اختبار (نحتفظ بالأحسن)
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  if (!dbReady()) return NextResponse.json({ ok: true });
  const { user } = await getViewer();
  if (!user) return NextResponse.json({ ok: true });
  const topic = String(b.topic ?? '').slice(0, 64);
  const level = Math.max(0, Math.min(3, Number(b.level) || 0));
  if (!topic) return NextResponse.json({ error: 'topic' }, { status: 400 });

  const d = createAdminClient();
  const { data: row } = await d.from('progress').select('known, quiz_best, quiz_total')
    .eq('user_id', user.id).eq('topic_id', topic).eq('level', level).maybeSingle();
  const known = new Set<string>(row?.known ?? []);
  if (Array.isArray(b.known)) b.known.slice(0, 200).forEach((k: unknown) => known.add(String(k).slice(0, 64)));
  let best = row?.quiz_best ?? null, total = row?.quiz_total ?? null;
  if (Number.isFinite(b.score) && Number.isFinite(b.total) && b.total > 0) {
    const score = Math.max(0, Math.min(Number(b.total), Number(b.score)));
    if (best === null || total === null || score / b.total >= best / total) { best = score; total = Number(b.total); }
  }
  const { error } = await d.from('progress').upsert(
    { user_id: user.id, topic_id: topic, level, known: [...known], quiz_best: best, quiz_total: total, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,topic_id,level' },
  );
  if (error) return NextResponse.json({ error: 'تعذّر الحفظ' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
