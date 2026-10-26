// عنوان الموقع العام: يُستعمل في sitemap.xml و robots.txt وروابط المشاركة. غيّره في Vercel عند ربط نطاق خاص
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://loraspain.vercel.app').replace(/\/+$/, '');
