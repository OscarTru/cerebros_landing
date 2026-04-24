create type blog_status as enum ('draft', 'published', 'archived');

create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  author text,
  image text,
  content text not null default '',
  reading_time int,
  headings jsonb,
  tags text[] default '{}',
  status blog_status not null default 'draft',
  views int not null default 0,
  created_by text not null,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_blog_posts_status_published
  on blog_posts (status, published_at desc);
create unique index if not exists idx_blog_posts_slug on blog_posts (slug);

drop trigger if exists blog_posts_updated_at on blog_posts;
create trigger blog_posts_updated_at
  before update on blog_posts
  for each row execute function set_updated_at();
