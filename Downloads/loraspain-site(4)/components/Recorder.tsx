'use client';
import { useRef, useState } from 'react';

// تسجيل الصوت من المتصفح، ثم وضعه في خانة الملف داخل نفس الاستمارة
export default function Recorder({ inputName = 'audio' }: { inputName?: string }) {
  const [state, setState] = useState<'idle' | 'rec' | 'done' | 'error'>('idle');
  const [url, setUrl] = useState('');
  const rec = useRef<MediaRecorder | null>(null);
  const box = useRef<HTMLDivElement>(null);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks: Blob[] = [];
      const r = new MediaRecorder(stream);
      r.ondataavailable = (e) => chunks.push(e.data);
      r.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const type = r.mimeType || 'audio/webm';
        const blob = new Blob(chunks, { type });
        setUrl(URL.createObjectURL(blob));
        const input = box.current?.closest('form')?.querySelector<HTMLInputElement>(`input[type=file][name="${inputName}"]`);
        if (input) {
          const dt = new DataTransfer();
          dt.items.add(new File([blob], `recording.${type.includes('mp4') ? 'm4a' : type.includes('ogg') ? 'ogg' : 'webm'}`, { type }));
          input.files = dt.files;
        }
        setState('done');
      };
      r.start();
      rec.current = r;
      setState('rec');
    } catch {
      setState('error');
    }
  }

  return (
    <div ref={box} className="rowf">
      {state !== 'rec'
        ? <button type="button" className="btn soft small" onClick={start}>🎙️ {state === 'done' ? 'أعد التسجيل' : 'سجّل بصوتك'}</button>
        : <button type="button" className="btn small" style={{ background: 'var(--red)', boxShadow: 'none' }} onClick={() => rec.current?.stop()}>⏹ أوقف التسجيل</button>}
      {state === 'rec' && <span className="danger">● جارٍ التسجيل…</span>}
      {state === 'done' && <><audio src={url} controls style={{ height: 34 }} /><span className="muted">اضغط «حفظ» ليُحفظ التسجيل</span></>}
      {state === 'error' && <span className="err">لم نستطع فتح الميكروفون. اسمح للموقع باستعماله من إعدادات المتصفح.</span>}
    </div>
  );
}
