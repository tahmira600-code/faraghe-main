// يجمع content/*.json (والمحتوى القديم في content/_existing) في lib/seed-content.json
// الاستعمال: node scripts/build-content.mjs
import fs from 'fs';

const dir = 'content';
const ids = new Set([...fs.readdirSync(`${dir}/_existing`), ...fs.readdirSync(dir)].filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)));
const cards = [], questions = [];
const report = [];
for (const id of [...ids].sort()) {
  const old = fs.existsSync(`${dir}/_existing/${id}.json`) ? JSON.parse(fs.readFileSync(`${dir}/_existing/${id}.json`, 'utf8')) : { cards: [], questions: [] };
  const neu = fs.existsSync(`${dir}/${id}.json`) ? JSON.parse(fs.readFileSync(`${dir}/${id}.json`, 'utf8')) : { cards: [], questions: [] };
  const seen = new Set();
  const mine = [
    ...old.cards.map((c) => ({ level: c.level, emoji: c.emoji, es: c.es, ar: c.tr.ar, section: c.section })),
    ...neu.cards,
  ].filter((c) => { const k = c.es.trim().toLowerCase(); if (!c.es || !c.ar || seen.has(k)) return false; seen.add(k); return true; });
  // بطاقات قديمة بلا قسم: نعطيها قسم البطاقة الجديدة الأقرب في نفس المستوى إن وُجد، وإلا «عام»
  mine.forEach((c, i) => cards.push({ topic_id: id, level: Math.min(3, Math.max(1, Number(c.level) || 1)), emoji: c.emoji || '📘', es: c.es.trim(), tr: { ar: c.ar.trim() }, section: c.section || 'عام', sort: i }));
  const seenQ = new Set();
  // أسئلة السياقة والجنسية: فقط من المصدر الرسمي (content/official/<id>.json)، وليس من الكتابة اليدوية
  const official = fs.existsSync(`${dir}/official/${id}.json`) ? JSON.parse(fs.readFileSync(`${dir}/official/${id}.json`, 'utf8')).questions : null;
  const strict = ['dgt', 'ccse'].includes(id);
  const qs = [
    ...(strict && official ? [] : old.questions.map((q) => ({ level: q.level, q: q.q, options: q.options, answer: q.answer, ar_q: q.tr.ar.q, ar_exp: q.tr.ar.exp }))),
    ...(strict ? official ?? [] : neu.questions ?? []),
  ].filter((q) => { const k = q.q.trim().toLowerCase(); if (seenQ.has(k) || !Array.isArray(q.options) || q.answer < 0 || q.answer >= q.options.length) return false; seenQ.add(k); return true; });
  qs.forEach((q, i) => questions.push({ topic_id: id, level: Math.min(3, Math.max(1, Number(q.level) || 1)), q: q.q.trim(), options: q.options, answer: q.answer, tr: { ar: { q: q.ar_q, exp: q.ar_exp + (q.ref ? ` (${q.ref})` : ''), ...(q.ar_options ? { options: q.ar_options } : {}) } }, sort: i }));
  report.push(`${id}: ${mine.length} cards, ${qs.length} questions`);
}
fs.writeFileSync('lib/seed-content.json', JSON.stringify({ cards, questions }));
console.log(report.join('\n'));
console.log(`total: ${cards.length} cards, ${questions.length} questions`);

// ---------- برنامج التعلم: content/course/unit-NN.json → lib/course.json ----------
const units = fs.existsSync(`${dir}/course`) ? fs.readdirSync(`${dir}/course`).filter((f) => /^unit-\d+\.json$/.test(f)).sort()
  .map((f) => JSON.parse(fs.readFileSync(`${dir}/course/${f}`, 'utf8'))) : [];
fs.writeFileSync('lib/course.json', JSON.stringify(units));
// ---------- دروس الباقات الرسمية: content/official/<id>-lessons.json → lib/package-lessons.json ----------
const pkgLessons = {};
for (const f of fs.readdirSync(`${dir}/official`).filter((f) => /-lessons\.json$/.test(f))) {
  const L = JSON.parse(fs.readFileSync(`${dir}/official/${f}`, 'utf8'));
  const qs = JSON.parse(fs.readFileSync(`${dir}/official/${L.topic_id}.json`, 'utf8')).questions;
  pkgLessons[L.topic_id] = L.chapters.map((c) => ({
    id: c.id, title_ar: c.title_ar, title_es: c.title_es, emoji: c.emoji, goal_ar: '',
    explain: c.explain.map((b) => ({ h: b.h, p: b.p, ex: b.ex, ref: b.ref })),
    words: c.words, dialog: [],
    quiz: (c.quiz_refs ?? []).map((i) => qs[i]).filter(Boolean).map((q) => ({ q: q.ar_q, es: q.q, o: q.options, otr: q.ar_options, a: q.answer, why: q.ar_exp + (q.ref ? ` (${q.ref})` : '') })),
  }));
  console.log(`${L.topic_id} lessons: ${L.chapters.length} chapters`);
}
fs.writeFileSync('lib/package-lessons.json', JSON.stringify(pkgLessons));
console.log(`course: ${units.length} units, ${units.reduce((n, u) => n + u.lessons.length, 0)} lessons`);

// ---------- القاموس: content/dict/entries-N.json → public/dict.json (مضغوط: مصفوفات) ----------
const seenD = new Set();
const dict = [];
if (fs.existsSync(`${dir}/dict`)) {
  for (const f of fs.readdirSync(`${dir}/dict`).filter((x) => /^entries-\d+\.json$/.test(x)).sort((a, b) => parseInt(a.slice(8)) - parseInt(b.slice(8)))) {
    for (const e of JSON.parse(fs.readFileSync(`${dir}/dict/${f}`, 'utf8'))) {
      const k = (e.es ?? '').trim().toLowerCase();
      if (!k || !e.ar || seenD.has(k)) continue;
      seenD.add(k);
      dict.push([e.es.trim(), e.pos ?? '', e.ar.trim(), e.ex ?? '', e.exar ?? '', e.e ?? '']);
    }
  }
}
fs.writeFileSync('public/dict.json', JSON.stringify(dict));
console.log(`dictionary: ${dict.length} entries`);
