import { EMOJI } from '@/lib/emoji-list';

export const emojiKey = (e: string) => [...e].map((c) => c.codePointAt(0)!.toString(16)).join('-').replace(/-fe0f/g, '').replace(/^fe0f-?/, '');

// أيقونة ثلاثية الأبعاد إن وُجدت صورتها، وإلا الإيموجي العادي
export default function Emo({ e, size = 48, className = '' }: { e: string; size?: number; className?: string }) {
  const k = emojiKey(e);
  if (!EMOJI.has(k)) return <span className={'emo t ' + className} style={{ fontSize: size * 0.8 }} aria-hidden="true">{e}</span>;
  return <img className={'emo ' + className} src={`/emoji/${k}.webp`} width={size} height={size} alt="" aria-hidden="true" loading="lazy" decoding="async" draggable={false} />;
}
