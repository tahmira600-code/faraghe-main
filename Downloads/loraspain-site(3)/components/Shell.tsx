import Link from 'next/link';
import { getViewer, isSoon } from '@/lib/access';
import { currentLang, loadSite } from '@/lib/data';
import LoginButton from './LoginButton';
import NavLinks, { type NavItem } from './NavLinks';

export default async function Shell({ children }: { children: React.ReactNode }) {
  const [{ topics, languages, settings }, viewer] = await Promise.all([loadSite(), getViewer()]);
  const lang = await currentLang(languages);
  const packages = topics.filter((t) => t.kind === 'package' && t.published);
  const items: NavItem[] = [
    { href: '/', icon: '🏠', label: 'الرئيسية' },
    { href: '/learn', icon: '🎯', label: 'برنامج التعلم' },
    { href: '/dictionary', icon: '📕', label: 'القاموس' },
    { href: '/jobs', icon: '🧑‍🌾', label: 'اختر عملك' },
    { href: '/quiz', icon: '🏆', label: 'الاختبارات' },
    ...packages.map((p) => ({ href: `/topic/${p.id}`, icon: p.emoji, label: p.name, soon: isSoon(p, settings) })),
    { href: '/account', icon: '🧑', label: 'حسابي' },
  ];
  if (viewer.isAdmin) items.push({ href: '/admin', icon: '⚙️', label: 'لوحة التحكم' });
  const enabled = languages.filter((l) => l.enabled);

  return (
    <div className={'app' + (settings.sound_enabled === '0' ? ' nosound' : '')}>
      <aside className="side">
        <Link href="/" className="logo">LoraSpain</Link>
        <NavLinks items={items} className="nl" />
        <div className="grow" />
        {packages.length > 0 && (
          <div className="prem"><b>🎓 الامتحانات الرسمية</b><small>{packages.filter((p) => !isSoon(p, settings)).map((p) => p.name).join(' و')}، مجانا بالكامل</small>
            <Link className="btn small" href={`/topic/${packages[0].id}`}>اكتشف</Link></div>
        )}
        <div className="who">
          {enabled.length > 1 && (
            <form action="/lang" method="get" className="f">
              <label>لغة الترجمة
                <select name="code" className="in" defaultValue={lang.code}>{enabled.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}</select>
              </label>
              <button className="btn ghost small" type="submit">تغيير</button>
            </form>
          )}
          {viewer.user ? (<>
            <span className="muted">👤 {viewer.user.name}</span>
            <form action="/auth/signout" method="post"><button className="btn ghost small" type="submit">خروج</button></form>
          </>) : <LoginButton className="btn small" />}
        </div>
      </aside>
      <main className="main">
        <div className="mtop"><Link href="/" className="logo">LoraSpain</Link>{viewer.user ? <span className="chip">👤 {viewer.user.name.split(' ')[0]}</span> : <LoginButton className="btn small" label="دخول" />}</div>
        <div className="page">{children}</div>
      </main>
      <nav className="bnav" aria-label="القائمة">
        <NavLinks items={[items[0], items[1], items[2], items[3], { href: '/account', icon: '🧑', label: 'حسابي' }]} className="" />
      </nav>
    </div>
  );
}
