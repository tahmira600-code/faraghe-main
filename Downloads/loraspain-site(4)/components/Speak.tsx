'use client';

let current: HTMLAudioElement | null = null;

function voicesReady(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((res) => {
    const v = speechSynthesis.getVoices();
    if (v.length) return res(v);
    const t = setTimeout(() => res(speechSynthesis.getVoices()), 1200);
    speechSynthesis.addEventListener('voiceschanged', () => { clearTimeout(t); res(speechSynthesis.getVoices()); }, { once: true });
  });
}

function bestSpanish(vs: SpeechSynthesisVoice[]) {
  const es = vs.filter((v) => /^es([-_]|$)/i.test(v.lang));
  const score = (v: SpeechSynthesisVoice) =>
    (/es[-_]ES/i.test(v.lang) ? 10 : 0) + (/natural|neural|enhanced|premium|google|online/i.test(v.name) ? 5 : 0) + (v.localService ? 0 : 1);
  return es.sort((a, b) => score(b) - score(a))[0] ?? null;
}

function hint() {
  if (document.getElementById('voice-hint')) return;
  const d = document.createElement('div');
  d.id = 'voice-hint';
  d.setAttribute('role', 'alert');
  d.style.cssText = 'position:fixed;inset:auto 16px 16px;margin:auto;max-width:460px;z-index:99;background:#fff;color:#2a2340;border:2px solid #7b5cff;border-radius:16px;padding:14px 16px;box-shadow:0 10px 30px rgba(0,0,0,.15);font-size:15px;line-height:1.7';
  d.innerHTML = '<b>لا يوجد صوت إسباني في هذا الجهاز.</b><br>افتح الموقع في Microsoft Edge أو Google Chrome، أو أضف صوت Español (España) من إعدادات ويندوز: الوقت واللغة ← الكلام ← إضافة أصوات.';
  d.onclick = () => d.remove();
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 9000);
}

// ملف الصوت الجاهز أولا، وإلا صوت الجهاز بالإسبانية
export async function speak(text: string, slow = false, audio?: string | null) {
  current?.pause();
  if (audio) {
    current = new Audio(audio);
    current.playbackRate = slow ? 0.7 : 1;
    try { await current.play(); return; } catch { /* نرجع إلى صوت الجهاز */ }
  }
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const all = await voicesReady();
  const v = bestSpanish(all);
  // الجهاز فيه أصوات لكن لا صوت إسباني: لا ننطق بلغة أخرى
  if (all.length && !v) return hint();
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'es-ES';
  if (v) { u.voice = v; u.lang = v.lang; }
  u.rate = slow ? 0.6 : 0.9;
  speechSynthesis.speak(u);
}

const PLAY = <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z" /></svg>;
const SLOW = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2M9 2h6" /></svg>;

export default function Speak({ text, audio, size = 'lg' }: { text: string; audio?: string | null; size?: 'lg' | 'sm' }) {
  if (size === 'sm') return <button type="button" className="play sm" aria-label="استمع" onClick={() => speak(text, false, audio)}>{PLAY}</button>;
  return (
    <div className="playrow">
      <button type="button" className="play slow" aria-label="استمع ببطء" onClick={() => speak(text, true, audio)}>{SLOW}</button>
      <button type="button" className="play" aria-label="استمع" onClick={() => speak(text, false, audio)}>{PLAY}</button>
    </div>
  );
}
