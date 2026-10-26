import 'server-only';
import { cache } from 'react';
import { createClient } from './supabase/server';
import { supabaseConfigured } from './supabase/config';
import type { Topic } from './types';

export type Viewer = {
  user: { id: string; email: string; name: string } | null;
  isAdmin: boolean;
};

const adminEmails = () => (process.env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);

export const getViewer = cache(async (): Promise<Viewer> => {
  if (!supabaseConfigured) return { user: null, isAdmin: false };
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { user: null, isAdmin: false };
  const meta = user.user_metadata ?? {};
  const email = (user.email ?? '').toLowerCase();
  return {
    user: { id: user.id, email, name: meta.full_name || meta.name || email },
    isAdmin: !!email && adminEmails().includes(email),
  };
});

// الموقع مجاني بالكامل: «مجاني» مفتوح للجميع، والباقي يُفتح بحساب Google مجانا
export const canOpen = (t: Topic, v: Viewer) => v.isAdmin || t.tier === 'free' || !!v.user;

// «قريبا»: الموضوع يظهر لكن لا يُفتح حتى يجهز محتواه الرسمي (يغيّره المدير من الإعدادات)
export const isSoon = (t: Topic, settings: { soon_topics?: string }) => (settings.soon_topics ?? '').split(',').includes(t.id);

