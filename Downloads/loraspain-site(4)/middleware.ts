import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseConfigured } from './lib/supabase/config';

// يجدد جلسة تسجيل الدخول في كل طلب
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  // الزائر بدون جلسة: لا داعي لسؤال Supabase
  if (!supabaseConfigured || !request.cookies.getAll().some((c) => c.name.startsWith('sb-'))) return response;
  const sb = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(list) {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  await sb.auth.getUser();
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};
