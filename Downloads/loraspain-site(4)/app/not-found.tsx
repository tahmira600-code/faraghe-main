import Link from 'next/link';
export default function NotFound() {
  return (<div style={{ padding: 40, display: 'grid', placeItems: 'center' }}><div className="lock"><h3>هذه الصفحة غير موجودة</h3><Link className="btn" href="/">الرجوع إلى البداية</Link></div></div>);
}
