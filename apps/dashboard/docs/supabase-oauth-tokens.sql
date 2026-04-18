-- Run this once in Supabase SQL Editor to enable OAuth token storage

create table if not exists oauth_tokens (
  provider text primary key,
  refresh_token text not null,
  access_token text,
  expires_at timestamptz,
  scope text,
  updated_at timestamptz default now()
);

-- Row Level Security: disable for service role use
alter table oauth_tokens enable row level security;

-- Policy: only service role can read/write
create policy "service role full access"
  on oauth_tokens for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
