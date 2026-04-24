create table if not exists newsletter_scheduled (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  body text not null,
  scheduled_at timestamptz not null,
  sent_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_newsletter_scheduled_pending
  on newsletter_scheduled (scheduled_at)
  where sent_at is null;
