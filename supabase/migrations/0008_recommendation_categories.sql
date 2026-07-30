-- Lets a recommendation apply to more than one category (e.g. a cafe that's
-- also a shop). recommendations.category remains the single "primary"
-- category that drives the star's color on the map; this table holds the
-- FULL set of categories a recommendation matches when guests filter
-- (always including the primary, kept in sync on every write from the API).

create table recommendation_categories (
  recommendation_id uuid not null references recommendations(id) on delete cascade,
  category category_enum not null references category_styles(category),
  primary key (recommendation_id, category)
);

create index recommendation_categories_category_idx on recommendation_categories(category);

alter table recommendation_categories enable row level security;

create policy "public read recommendation categories"
  on recommendation_categories for select
  using (true);

create policy "authenticated write recommendation categories"
  on recommendation_categories for all
  to authenticated
  using (true)
  with check (true);

grant select, insert, update, delete on recommendation_categories to anon, authenticated, service_role;

-- Backfill: every existing recommendation's current primary category becomes
-- its first (and so far only) entry in the set.
insert into recommendation_categories (recommendation_id, category)
select id, category from recommendations
on conflict do nothing;
