-- الصق هذا في SQL Editor ثم Run (مرة واحدة)
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
