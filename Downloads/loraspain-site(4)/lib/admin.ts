import 'server-only';
import { redirect } from 'next/navigation';
import { getViewer } from './access';
import { dbReady } from './data';

// معاينة لوحة التحكم محليا فقط (قراءة فقط) عندما لا تكون قاعدة البيانات مربوطة
export const previewMode = () => !dbReady() && process.env.ADMIN_PREVIEW === '1';

export async function requireAdmin() {
  if (previewMode()) return { email: 'preview', preview: true };
  const v = await getViewer();
  if (!v.user) redirect('/account');
  if (!v.isAdmin) redirect('/');
  return { email: v.user.email, preview: false };
}
