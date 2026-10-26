# Dictionary brief (LoraSpain: Spanish → Arabic for Arabic-speaking immigrants in Spain)

Input: /home/user/loraspain/content/dict/forms-N.json — a list of 2000 Spanish word FORMS ordered by frequency (most frequent first). They include inflections (empezamos, dibujos), proper names and junk.

Output: /home/user/loraspain/content/dict/entries-N.json — a JSON array. For each form, produce the dictionary LEMMA entry (infinitive for verbs, masculine singular for adjectives, singular for nouns). Skip: proper names (people, brands, cities, countries except as adjectives like "español"), English words, abbreviations, interjection junk, offensive/sexual slang, and any lemma you already produced earlier in the same file. Keep the order of first appearance.

Each entry:
{ "es": "comer", "pos": "v", "g": "", "ar": "أَكَلَ ، يأكل", "ex": "Comemos a las dos.", "exar": "نأكل في الساعة الثانية.", "e": "🍽️" }

- "es": the lemma. For nouns include the article: "la casa", "el agua", "los padres" only if normally plural.
- "pos": one of n (noun), v (verb), adj, adv, prep, conj, pron, det, num, interj, expr.
- "ar": accurate Modern Standard Arabic meaning(s), simple, 1–3 meanings separated by " ، ". Verbs: give the past and present like "أكل ، يأكل". No transliteration.
- "ex": one short, natural Spanish example sentence (Spain usage) using the word (any form). "exar": its Arabic translation.
- "e": ONE emoji only if it clearly depicts the word (concrete nouns, some verbs/adjectives); otherwise "".
- Accuracy matters. Valid JSON (UTF-8). Validate with node -e "JSON.parse(require('fs').readFileSync(FILE,'utf8'))" and report only the number of entries.
- Write the file in several passes if needed (e.g. build it with a Python script that holds your entries in chunks) — but the content must be your own careful translations, never auto-generated placeholders.
- Do not touch any other file. Do not install packages.
