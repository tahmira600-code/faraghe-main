import data from './course.json';

export type Lesson = {
  id: string; title_ar: string; title_es: string; emoji: string; goal_ar: string;
  explain: { h: string; p: string; ex?: [string, string][]; ref?: string }[];
  words: { es: string; ar: string; e?: string }[];
  dialog: { who: string; es: string; ar: string }[];
  quiz: { q: string; es?: string; o: string[]; otr?: string[]; a: number; why: string }[];
};
export type Unit = { unit: number; level: number; title_ar: string; title_es: string; emoji: string; lessons: Lesson[] };

export const UNITS = data as unknown as Unit[];
export const ALL_LESSONS = UNITS.flatMap((u) => u.lessons.map((l) => ({ ...l, unit: u.unit, level: u.level })));
export const findLesson = (id: string) => {
  const i = ALL_LESSONS.findIndex((l) => l.id === id);
  return i < 0 ? null : { lesson: ALL_LESSONS[i], index: i, next: ALL_LESSONS[i + 1] ?? null, prev: ALL_LESSONS[i - 1] ?? null };
};

// دروس الباقات (السياقة…) من المصدر الرسمي، نفس شكل الدرس بدون حوار
import pkg from './package-lessons.json';
export const PACKAGE_LESSONS = pkg as unknown as Record<string, Lesson[]>;
