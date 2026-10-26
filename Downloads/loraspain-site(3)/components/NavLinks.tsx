'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Emo from './Emo';

export type NavItem = { href: string; icon: string; label: string; soon?: boolean };

export default function NavLinks({ items, className }: { items: NavItem[]; className: string }) {
  const path = usePathname();
  const active = (h: string) => (h === '/' || h === '/admin' ? path === h : path.startsWith(h.split('?')[0]));
  return (<>
    {items.map((n) => (
      <Link key={n.href} href={n.href} className={className} aria-current={active(n.href) ? 'page' : undefined}>
        <span><Emo e={n.icon} size={24} /></span>{n.label}{n.soon && <small className="soonb">قريبا</small>}
      </Link>
    ))}
  </>);
}
