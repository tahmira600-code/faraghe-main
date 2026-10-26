# Content brief for LoraSpain (Spanish for Arabic speakers living/working in Spain)

Audience: Arabic-speaking immigrants in Spain (many Moroccan workers, often in agriculture). UI language is Arabic (Modern Standard Arabic, simple, clear, no country/dialect references). Spanish is Castilian Spanish as used in Spain (vosotros, "conducir", "móvil", "ordenador", "coche", euros, Spanish institutions).

Write ONE JSON file per topic at /home/user/loraspain/content/<topic_id>.json with EXACTLY this shape:

{
  "topic_id": "<id>",
  "cards": [
    { "level": 1, "emoji": "🍞", "es": "el pan", "ar": "الخبز", "section": "الطعام" }
  ],
  "questions": [
    { "level": 1, "q": "<question in Spanish>", "options": ["...", "...", "..."], "answer": 0,
      "ar_q": "<the question translated to Arabic>", "ar_exp": "<short Arabic explanation of the correct answer>" }
  ]
}

Rules:
- Read /home/user/loraspain/content/_existing/<topic_id>.json first. Keep the spirit; do NOT repeat its cards (different "es" text). The existing cards will be merged with yours.
- level: 1 = beginner (single words, very short phrases), 2 = intermediate (useful full sentences), 3 = advanced (longer sentences, formal/official language, typical phrases you hear from officials, doctors, bosses, examiners). Aim roughly 40% / 35% / 25%.
- "es": correct Spanish with accents and ¿ ¡. Nouns WITH article (el/la/los/las). Sentences start with capital and end with punctuation.
- "ar": natural, accurate Arabic translation (fusha, simple). No transliteration.
- "emoji": exactly ONE standard Unicode emoji that best depicts the card (no flags, no ZWJ family/skin-tone sequences, no country symbols, no religious symbols). Prefer concrete object emoji.
- "section": a short Arabic sub-category name (2-3 words) grouping cards inside the topic, 4-8 sections per topic, e.g. "التحية", "الأرقام", "في الحقل", "السلامة".
- Questions: multiple choice with 3 options (4 for DGT/CCSE allowed: use 3 for DGT like the real exam, 3 for CCSE like the real exam). "answer" is the 0-based index of the correct option. Vary the position of the correct answer. Questions test understanding of the topic's vocabulary/situations (for normal topics: "¿Qué significa ...?", "¿Qué dices cuando ...?", situational). Every question must have exactly one clearly correct answer.
- ACCURACY IS CRITICAL. Real people rely on this. Only include facts you are certain about. For official procedures/laws use the generic, stable facts (no prices that change, no dates you are unsure of). When unsure, leave it out.
- Valid JSON only (UTF-8, double quotes, no comments, no trailing commas). After writing, validate with: node -e "JSON.parse(require('fs').readFileSync('<file>','utf8'))" and print counts per level.
- Do not touch any other file. Do not install packages.
