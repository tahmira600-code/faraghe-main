// ينسخ صور الأيقونات ثلاثية الأبعاد (Fluent Emoji 3D، رخصة MIT) التي يستعملها المحتوى إلى public/emoji
// الاستعمال: node scripts/emoji.mjs <مجلد assets من الحزمة @lobehub/fluent-emoji-3d>
import fs from 'fs';
import path from 'path';

const src = process.argv[2];
if (!src) { console.error('usage: node scripts/emoji.mjs <assets dir>'); process.exit(1); }
const files = new Map(fs.readdirSync(src).filter((f) => f.endsWith('.webp')).map((f) => [f.slice(0, -5).replace(/-fe0f/g, ''), f]));
const key = (e) => [...e].map((c) => c.codePointAt(0).toString(16)).join('-').replace(/-fe0f/g, '').replace(/^fe0f-?/, '');

const text = [fs.readFileSync('lib/seed.ts', 'utf8'), fs.readFileSync('lib/seed-content.json', 'utf8'), ...fs.readdirSync('components').filter((f) => f.endsWith('.tsx')).map((f) => fs.readFileSync('components/' + f, 'utf8')),
  ...fs.readdirSync('app', { recursive: true }).filter((f) => f.endsWith('.tsx')).map((f) => fs.readFileSync(path.join('app', f), 'utf8'))].join('\n');
const found = new Set();
for (const m of text.matchAll(/\p{Extended_Pictographic}(️)?(‍\p{Extended_Pictographic}️?)*/gu)) found.add(key(m[0]));
// أيقونات إضافية شائعة يختارها المدير لاحقا
for (const extra of (process.env.EXTRA ?? '').split(',').filter(Boolean)) found.add(extra);

fs.rmSync('public/emoji', { recursive: true, force: true });
fs.mkdirSync('public/emoji', { recursive: true });
const ok = [];
for (const k of [...found].sort()) {
  const f = files.get(k);
  if (!f) continue;
  fs.copyFileSync(path.join(src, f), `public/emoji/${k}.webp`);
  ok.push(k);
}
fs.writeFileSync('lib/emoji-list.ts', `// مولّد بـ scripts/emoji.mjs: الأيقونات الموجودة في public/emoji\nexport const EMOJI = new Set(${JSON.stringify(ok)});\n`);
console.log(`${ok.length} icons copied, ${found.size - ok.length} without image`);
