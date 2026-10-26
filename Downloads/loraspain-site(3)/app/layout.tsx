import type { Metadata, Viewport } from 'next';
import { Baloo_Bhaijaan_2, Rubik } from 'next/font/google';
import { SITE_URL } from '@/lib/site';
import './globals.css';

export const dynamic = 'force-dynamic';

// الخطوط تُحمَّل من موقعنا نفسه، فلا تنتظر الصفحة Google Fonts
const head = Baloo_Bhaijaan_2({ subsets: ['arabic', 'latin'], weight: ['500', '700', '800'], variable: '--font-head', display: 'swap' });
const body = Rubik({ subsets: ['arabic', 'latin'], weight: ['400', '500', '600', '700'], variable: '--font-body', display: 'swap' });

const description = 'تعلّم الإسبانية بالعربية مجانا: كلمات وجمل العمل والإدارة، دروس خطوة بخطوة، قاموس، ونطق صحيح لكل كلمة.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'LoraSpain · تعلّم الإسبانية بالعربية', template: '%s | LoraSpain' },
  description,
  applicationName: 'LoraSpain',
  keywords: ['تعلم الإسبانية', 'اللغة الإسبانية بالعربية', 'الإسبانية للمبتدئين', 'العمل في إسبانيا', 'رخصة السياقة إسبانيا', 'aprender español árabe'],
  openGraph: { type: 'website', siteName: 'LoraSpain', locale: 'ar_AR', url: '/', title: 'LoraSpain · تعلّم الإسبانية بالعربية', description, images: ['/icon.png'] },
  twitter: { card: 'summary', title: 'LoraSpain · تعلّم الإسبانية بالعربية', description, images: ['/icon.png'] },
  // Google Search Console: ضع رمز التحقق في Vercel باسم GOOGLE_SITE_VERIFICATION (الجزء الموجود داخل content="…" فقط)
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon.png', apple: '/icon.png' },
};
export const viewport: Viewport = { themeColor: '#7b5cff', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${head.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
