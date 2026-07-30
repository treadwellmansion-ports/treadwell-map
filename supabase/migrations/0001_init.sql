-- Treadwell Downtown Portsmouth Recommendation Map: initial schema + seed data

create extension if not exists "pgcrypto";

create type category_enum as enum ('restaurant','cafe','entertainment','historical','shop','art');

create table category_styles (
  category category_enum primary key,
  color text not null,
  label text not null
);

create table map_config (
  id int primary key default 1,
  center_lat double precision not null,
  center_lng double precision not null,
  zoom double precision not null,
  min_zoom double precision not null,
  max_zoom double precision not null,
  max_bounds jsonb not null, -- [[swLng,swLat],[neLng,neLat]]
  style_url text,
  constraint singleton check (id = 1)
);

create table recommendations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category category_enum not null references category_styles(category),
  description text not null default '',
  address text not null,
  lat double precision not null,
  lng double precision not null,
  photos text[] not null default '{}',
  website text,
  phone text,
  hours jsonb,
  published boolean not null default true,
  is_select boolean not null default false,
  select_note text,
  display_order int not null default 0,
  walking_distance_meters int,
  walking_time_minutes int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index recommendations_category_idx on recommendations(category);
create index recommendations_published_idx on recommendations(published);
create index recommendations_is_select_idx on recommendations(is_select);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger recommendations_set_updated_at
  before update on recommendations
  for each row execute function set_updated_at();

-- Row Level Security: public/anon can read published recommendations and
-- global config; only authenticated (staff) users can write.
alter table recommendations enable row level security;
alter table category_styles enable row level security;
alter table map_config enable row level security;

create policy "public read published recommendations"
  on recommendations for select
  using (published = true);

create policy "authenticated read all recommendations"
  on recommendations for select
  to authenticated
  using (true);

create policy "authenticated write recommendations"
  on recommendations for all
  to authenticated
  using (true)
  with check (true);

create policy "public read category styles"
  on category_styles for select
  using (true);

create policy "authenticated write category styles"
  on category_styles for all
  to authenticated
  using (true)
  with check (true);

create policy "public read map config"
  on map_config for select
  using (true);

create policy "authenticated write map config"
  on map_config for all
  to authenticated
  using (true)
  with check (true);

-- Seed: default category styles (Section 5 of spec)
insert into category_styles (category, color, label) values
  ('restaurant',    '#8C2F39', 'Restaurants'),
  ('cafe',          '#B66A3C', 'Cafés'),
  ('entertainment', '#25476A', 'Entertainment'),
  ('historical',    '#A98235', 'Historical Sites'),
  ('shop',          '#3F6844', 'Shops'),
  ('art',           '#76517B', 'Art');

-- Seed: default MapConfig (Section 3 of spec).
-- max_bounds is an approximate downtown-Portsmouth box (North Mill Pond/Deer St
-- to the north, Piscataqua waterfront to the east, Strawbery Banke/South End to
-- the south, Middle Street to the west) -- tune in the admin MapConfig editor.
insert into map_config (id, center_lat, center_lng, zoom, min_zoom, max_zoom, max_bounds, style_url) values (
  1,
  43.0760,
  -70.7570,
  16,
  14,
  19,
  '[[-70.7680, 43.0680], [-70.7500, 43.0820]]'::jsonb,
  null
);
