/** @type {import('next').NextConfig} */
const nextConfig = {
  // تسجيلات الصوت المرفوعة من لوحة التحكم
  experimental: { serverActions: { bodySizeLimit: '8mb' } },
};
export default nextConfig;
