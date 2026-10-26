'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { supabaseConfigured } from '@/lib/supabase/config';

export default function LoginButton({ label = 'الدخول بحساب Google', className = 'btn' }: { label?: string; className?: string }) {
  const [msg, setMsg] = useState('');
  async function go() {
    if (!supabaseConfigured) { setMsg('تسجيل الدخول غير مفعّل بعد: أضف مفاتيح Supabase.'); return; }
    const next = location.pathname + location.search;
    const { error } = await createClient().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) setMsg('تعذّر فتح صفحة Google. حاول مرة أخرى.');
  }
  return (
    <>
      <button type="button" className={className} onClick={go}>
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.7 13.2l7.8 6C12.4 13.6 17.7 9.5 24 9.5z" /><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 7.1-10 7.1-17.5z" /><path fill="#FBBC05" d="M10.5 28.8A14.5 14.5 0 0 1 9.5 24c0-1.7.3-3.3.9-4.8l-7.8-6A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6z" /><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.2-13.5-9.9l-7.9 6C6.6 42.6 14.6 48 24 48z" /></svg>
        {label}
      </button>
      {msg && <p className="err">{msg}</p>}
    </>
  );
}
