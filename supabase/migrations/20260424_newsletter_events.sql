-- Eventos de Resend: delivered, opened, clicked, bounced, complained, unsubscribed.
-- Permite calcular open rate / click rate por broadcast.

create table if not exists newsletter_events (
  id uuid primary key default gen_random_uuid(),
  broadcast_id text,
  email_id text,
  email text not null,
  event_type text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_newsletter_events_broadcast
  on newsletter_events (broadcast_id, event_type);
create index if not exists idx_newsletter_events_email
  on newsletter_events (email, created_at desc);

-- Guardar broadcast_id en draft para enlazar envío <-> eventos.
alter table newsletter_drafts
  add column if not exists broadcast_id text;
