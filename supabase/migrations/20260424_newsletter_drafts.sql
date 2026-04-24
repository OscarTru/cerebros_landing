create type draft_mode as enum ('blocks', 'markdown', 'html');
create type draft_status as enum ('draft', 'pending_approval', 'approved', 'sent', 'cancelled');

create table if not exists newsletter_drafts (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Sin título',
  subject text not null default '',
  mode draft_mode not null default 'blocks',
  blocks jsonb,
  markdown text,
  html text,
  status draft_status not null default 'draft',
  created_by text not null,
  approved_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists newsletter_drafts_updated_at on newsletter_drafts;
create trigger newsletter_drafts_updated_at
  before update on newsletter_drafts
  for each row execute function set_updated_at();

alter table newsletter_scheduled
  add column if not exists draft_id uuid references newsletter_drafts(id) on delete set null,
  add column if not exists approved_by text;

create index if not exists idx_newsletter_drafts_status
  on newsletter_drafts (status, updated_at desc);
