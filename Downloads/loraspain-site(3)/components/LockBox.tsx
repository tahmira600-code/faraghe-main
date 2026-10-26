import LoginButton from './LoginButton';
import type { Topic } from '@/lib/types';

export default function LockBox({ topic }: { topic: Topic }) {
  return (
    <div className="lock">
      <h3>🔒 افتح «{topic.name}» مجانا</h3>
      <p>أنشئ حسابا بـ Gmail لتفتح هذا الموضوع كاملا، بدون أي دفع.</p>
      <LoginButton label="إنشاء حساب بـ Google" />
    </div>
  );
}
