create extension if not exists vector;
create table profiles(id uuid primary key references auth.users on delete cascade,
 skin_type text check (skin_type in ('dry','oily','combination','normal','unsure')),
 sensitivity text check (sensitivity in ('none','sometimes','sensitive')),
 goal text, budget_aud numeric, created_at timestamptz default now());
create table user_products(id uuid primary key default gen_random_uuid(),
 user_id uuid not null references profiles on delete cascade,
 name text not null, category text not null, ingredients text[], created_at timestamptz default now());
create table tutorials(id uuid primary key default gen_random_uuid(),
 user_id uuid not null references profiles on delete cascade,
 title text not null, source_type text check (source_type in ('text','video','link','screenshot')),
 raw_input text, status text default 'done', created_at timestamptz default now());
create table tutorial_steps(id uuid primary key default gen_random_uuid(),
 tutorial_id uuid not null references tutorials on delete cascade,
 position int not null, title text not null, category text, instruction text, caution text,
 timestamp_sec int, source text not null check (source in ('explicit','inferred')), optional boolean default false);
create table routines(id uuid primary key default gen_random_uuid(),
 user_id uuid not null references profiles on delete cascade,
 tutorial_id uuid references tutorials, title text, plan jsonb not null, created_at timestamptz default now());
create table practice_sessions(id uuid primary key default gen_random_uuid(),
 routine_id uuid not null references routines on delete cascade,
 user_id uuid not null references profiles on delete cascade,
 completion_level text not null check (completion_level in ('self_reported','quiz_passed','independent')),
 quiz_score int, difficulties text[], created_at timestamptz default now());
create table kb_documents(id uuid primary key default gen_random_uuid(),
 title text not null, source_url text not null, publisher text,
 evidence_level text not null check (evidence_level in ('strong','limited','creator_only','none')),
 updated_at date, summary text, embedding vector(1536));
alter table profiles enable row level security;
alter table user_products enable row level security;
alter table tutorials enable row level security;
alter table routines enable row level security;
alter table practice_sessions enable row level security;
create policy own_profile on profiles using (id=auth.uid());
create policy own_products on user_products using (user_id=auth.uid());
create policy own_tutorials on tutorials using (user_id=auth.uid());
create policy own_routines on routines using (user_id=auth.uid());
create policy own_sessions on practice_sessions using (user_id=auth.uid());
