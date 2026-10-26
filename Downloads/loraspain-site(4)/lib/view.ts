import 'server-only';
import { tr } from './data';
import type { Card } from './types';
import type { LessonCard } from '@/components/Lesson';

export const toLesson = (cards: Card[], code: string): LessonCard[] =>
  cards.map((c) => ({ id: c.id, topic: c.topic_id, emoji: c.emoji, es: c.es, t: tr(c.tr, code), audio: c.audio_url ?? null, section: c.section || '' }));

export const PREVIEW = 2;
