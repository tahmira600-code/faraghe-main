// يرسل التقدم إلى الخادم (يُحفظ فقط للمستخدم المسجل)، دون أن ينتظر الزائر الجواب
export function saveProgress(body: { topic: string; level: number; known?: string[]; score?: number; total?: number }) {
  fetch('/api/progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), keepalive: true }).catch(() => {});
}
