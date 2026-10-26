import Link from 'next/link';
import NavLinks from '@/components/NavLinks';
import { previewMode, requireAdmin } from '@/lib/admin';
import { dbReady } from '@/lib/data';

export const metadata = { title: 'لوحة التحكم', robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const me = await requireAdmin();
  const items = [
    { href: '/admin', icon: '📊', label: 'نظرة عامة' },
    { href: '/admin/users', icon: '👥', label: 'المستخدمون' },
    { href: '/admin/reports', icon: '⚑', label: 'البلاغات' },
    { href: '/admin/cards', icon: '🃏', label: 'البطاقات' },
    { href: '/admin/questions', icon: '🏆', label: 'الأسئلة' },
    { href: '/admin/topics', icon: '🗂️', label: 'المواضيع والمهن' },
    { href: '/admin/languages', icon: '🌐', label: 'لغات الترجمة' },
    { href: '/admin/settings', icon: '⚙️', label: 'الإعدادات والصوت' },
  ];
  return (
    <div className="app adm">
      <aside className="side">
        <Link href="/admin" className="logo">LoraSpain<small>لوحة التحكم</small></Link>
        <NavLinks items={items} className="nl" />
        <div className="grow" />
        <Link href="/" className="nl"><span>↗</span>عرض الموقع</Link>
        <div className="who">👤 {me.email}</div>
      </aside>
      <main className="main">
        <div className="mtop"><Link href="/admin" className="logo">لوحة التحكم</Link><Link href="/" className="chip">الموقع</Link></div>
        <div className="page">
          {!dbReady() && <div className="warn">{previewMode() ? 'معاينة فقط: قاعدة البيانات غير مربوطة، فالحفظ لا يعمل هنا.' : 'قاعدة البيانات غير مربوطة بعد.'}</div>}
          {children}
        </div>
      </main>
    </div>
  );
}
