-- LoraSpain: كل الجداول. شغّل هذا الملف مرة واحدة في Supabase > SQL Editor.
-- المحتوى يُقرأ من الخادم فقط بمفتاح service role، لذلك لا توجد سياسات قراءة عامة عليه.

create table if not exists public.languages (
  code text primary key,
  name text not null,
  dir text not null default 'rtl' check (dir in ('rtl', 'ltr')),
  sort integer not null default 0,
  enabled boolean not null default true
);

create table if not exists public.topics (
  id text primary key,
  kind text not null default 'topic' check (kind in ('topic', 'job', 'package')),
  name text not null,
  name_es text not null default '',
  emoji text not null default '📘',
  color text not null default 'c1',
  tier text not null default 'free' check (tier in ('free', 'account', 'paid')),
  price_cents integer not null default 0,
  blurb text not null default '',
  sort integer not null default 0,
  published boolean not null default true
);

create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  topic_id text not null references public.topics(id) on delete cascade,
  level smallint not null default 1 check (level between 1 and 3),
  emoji text not null default '',
  es text not null,
  tr jsonb not null default '{}'::jsonb,       -- {"ar": "...", "fr": "..."}
  section text not null default '',
  audio_url text,
  sort integer not null default 0
);
create index if not exists cards_topic on public.cards(topic_id, sort);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  topic_id text not null references public.topics(id) on delete cascade,
  level smallint not null default 1,
  q text not null,
  options jsonb not null,                       -- ["...", "...", "..."]
  answer smallint not null,                     -- رقم الجواب الصحيح (يبدأ من 0)
  tr jsonb not null default '{}'::jsonb,        -- {"ar": {"q": "...", "exp": "..."}}
  sort integer not null default 0
);
create index if not exists questions_topic on public.questions(topic_id, sort);

create table if not exists public.settings (
  key text primary key,
  value text not null
);

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  package_id text not null,
  provider text not null check (provider in ('stripe', 'paypal')),
  provider_ref text not null unique,
  amount_cents integer not null,
  currency text not null default 'eur',
  created_at timestamptz not null default now(),
  unique (user_id, package_id)
);

alter table public.languages enable row level security;
alter table public.topics enable row level security;
alter table public.cards enable row level security;
alter table public.questions enable row level security;
alter table public.settings enable row level security;
alter table public.purchases enable row level security;

drop policy if exists "read own purchases" on public.purchases;
create policy "read own purchases" on public.purchases for select using (auth.uid() = user_id);

-- ملفات الصوت التي ترفعها من لوحة التحكم
insert into storage.buckets (id, name, public) values ('audio', 'audio', true) on conflict (id) do nothing;

-- بلاغات الزوار عن مشكلة في بطاقة أو سؤال
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  item_type text not null default 'card' check (item_type in ('card', 'question')),
  item_id text,
  topic_id text,
  item_text text not null default '',
  kind text not null,
  note text not null default '',
  user_id uuid,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists reports_open on public.reports(resolved, created_at desc);
alter table public.reports enable row level security;

-- تقدم كل مستخدم: البطاقات التي يعرفها وأحسن نتيجة في الاختبار
-- topic_id = '_level' لاختبار المستوى العام، و level = 0 لأسئلة الموضوع
create table if not exists public.progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id text not null,
  level smallint not null default 1,
  known text[] not null default '{}',
  quiz_best integer,
  quiz_total integer,
  updated_at timestamptz not null default now(),
  primary key (user_id, topic_id, level)
);
alter table public.progress enable row level security;
drop policy if exists "read own progress" on public.progress;
create policy "read own progress" on public.progress for select using (auth.uid() = user_id);
