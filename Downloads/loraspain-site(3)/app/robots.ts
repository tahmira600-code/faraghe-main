import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// يخبر Google بما يفهرسه: صفحات التعلم نعم، ولوحة التحكم والحساب لا
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/auth/', '/account', '/lang'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
