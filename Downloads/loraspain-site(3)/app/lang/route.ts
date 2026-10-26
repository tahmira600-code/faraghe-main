import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = (url.searchParams.get('code') ?? 'ar').slice(0, 10);
  const back = req.headers.get('referer');
  const res = NextResponse.redirect(back && new URL(back).origin === url.origin ? back : new URL('/', url.origin));
  res.cookies.set('lang', code, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
  return res;
}
