# Course brief: LoraSpain "برنامج التعلم خطوة بخطوة"

Audience: Arabic-speaking adults (many Moroccan workers) living in Spain, starting from zero. Explanations in simple Modern Standard Arabic, no dialect, no country references. Spanish is Castilian (Spain).

The course has 12 units × 5 lessons = 60 lessons, CEFR A1 → B1:
- Units 1–4 (A1): saludos y presentarse; el alfabeto, números y la hora; ser/estar, artículos y género; familia, casa y rutina (presente regular), comida y compras.
- Units 5–8 (A2): presente irregular y verbos reflexivos; la ciudad y direcciones (preposiciones); el trabajo (gustar, tener que, ir a + infinitivo); la salud y el médico; pretérito perfecto; administración y citas.
- Units 9–12 (B1): pretérito indefinido e imperfecto; futuro y condicional; imperativo (instrucciones en el trabajo); subjuntivo básico (quiero que, es importante que); conversaciones reales: alquilar piso, entrevista de trabajo, banco, reclamar.
(Adjust slightly for a natural progression; each lesson builds on the previous ones.)

Write ONE file per unit: /home/user/loraspain/content/course/unit-NN.json (NN = 01..12) with exactly:
{
  "unit": 1, "level": 1, "title_ar": "...", "title_es": "...", "emoji": "👋",
  "lessons": [
    {
      "id": "u01-l1", "title_ar": "...", "title_es": "...", "emoji": "👋",
      "goal_ar": "ستتعلم في هذا الدرس ...",
      "explain": [ { "h": "عنوان قصير", "p": "شرح بالعربية، 1-4 جمل", "ex": [["Hola, me llamo Ali.", "مرحبا، اسمي علي."]] } ],
      "words": [ { "es": "hola", "ar": "مرحبا", "e": "👋" } ],
      "dialog": [ { "who": "A", "es": "...", "ar": "..." } ],
      "quiz": [ { "q": "سؤال بالعربية أو جملة بالإسبانية", "o": ["...", "...", "..."], "a": 0, "why": "شرح قصير بالعربية" } ]
    }
  ]
}
- level: 1 for units 1–4, 2 for 5–8, 3 for 9–12.
- explain: 2–4 blocks per lesson, grammar/usage explained simply with 1–3 examples each.
- words: 8–12 key words/phrases per lesson, each with ONE emoji that depicts it (or "" if none fits).
- dialog: 4–8 short lines of a realistic situation in Spain (A/B speakers), with Arabic translation.
- quiz: 5 multiple-choice questions (3 options, "a" = 0-based index, vary positions), testing THIS lesson.
- Accuracy is critical (grammar, accents, ¿¡). Valid JSON. Validate each file with node JSON.parse and report counts.
- Do not touch other files. Do not install packages.
