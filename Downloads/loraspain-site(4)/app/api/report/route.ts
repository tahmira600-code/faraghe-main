import { NextResponse } from 'next/server';
import { getViewer } from '@/lib/access';
import { dbReady } from '@/lib/data';
import { createAdminClient } from '@/lib/supabase/admin';

const KINDS = ['sound', 'translation', 'spanish', 'image', 'other'];

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const kind = KINDS.includes(b.kind) ? b.kind : 'other';
  const cut = (v: unknown, n: number) => String(v ?? '').slice(0, n);
  if (!dbReady()) return NextResponse.json({ ok: true });
  const { user } = await getViewer();
  const { error } = await createAdminClient().from('reports').insert({
    item_type: b.type === 'question' ? 'question' : 'card',
    item_id: cut(b.id, 64), topic_id: cut(b.topic, 64), item_text: cut(b.text, 300),
    kind, note: cut(b.note, 500), user_id: user?.id ?? null,
  });
  if (error) return NextResponse.json({ error: 'تعذّر الإرسال' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
