-- Abuse protection for the guest-facing write paths (step 1 of 2; step 2 is
-- 0016_revoke_anon_inserts.sql, applied once the new server routes are live).
-- Safe to run on its own and idempotent: it only adds columns, indexes,
-- size limits and a function, and does not change who can write.

-- A salted hash of the caller's IP (never the raw address), so the server can
-- rate-limit per visitor without storing anything identifying.
alter table analytics_events add column if not exists ip_hash text;
alter table issue_reports add column if not exists ip_hash text;
alter table cart_submissions add column if not exists ip_hash text;

create index if not exists analytics_events_ip_created_idx on analytics_events (ip_hash, created_at);
create index if not exists issue_reports_ip_created_idx on issue_reports (ip_hash, created_at);
create index if not exists cart_submissions_ip_created_idx on cart_submissions (ip_hash, created_at);
create index if not exists cart_submissions_email_created_idx on cart_submissions (guest_email, created_at);

-- Row-size limits, so no single insert can be huge even if one slipped past the API.
alter table analytics_events drop constraint if exists analytics_events_query_len;
alter table analytics_events add constraint analytics_events_query_len
  check (query is null or char_length(query) <= 100);
alter table analytics_events drop constraint if exists analytics_events_view_mode_values;
alter table analytics_events add constraint analytics_events_view_mode_values
  check (view_mode is null or view_mode in ('map', 'list'));

alter table issue_reports drop constraint if exists issue_reports_message_len;
alter table issue_reports add constraint issue_reports_message_len
  check (message is null or char_length(message) <= 500);
alter table issue_reports drop constraint if exists issue_reports_name_len;
alter table issue_reports add constraint issue_reports_name_len
  check (char_length(recommendation_name) <= 120);

alter table cart_submissions drop constraint if exists cart_submissions_email_len;
alter table cart_submissions add constraint cart_submissions_email_len
  check (char_length(guest_email) <= 254);
alter table cart_submissions drop constraint if exists cart_submissions_name_len;
alter table cart_submissions add constraint cart_submissions_name_len
  check (guest_name is null or char_length(guest_name) <= 80);
alter table cart_submissions drop constraint if exists cart_submissions_reason_len;
alter table cart_submissions add constraint cart_submissions_reason_len
  check (failure_reason is null or char_length(failure_reason) <= 500);
alter table cart_submissions drop constraint if exists cart_submissions_ids_count;
alter table cart_submissions add constraint cart_submissions_ids_count
  check (cardinality(recommendation_ids) between 1 and 25);

-- Clears the Supabase advisor warning about a mutable search_path.
alter function public.set_updated_at() set search_path = public;

-- "Popular with guests", computed in the database. Replaces fetching raw rows
-- (which the API silently capped at 1000) and limits how much any one source
-- can add: each visitor/day counts at most p_per_ip_daily_cap views per listing,
-- so one person repeating views can't push a listing onto the Popular list.
-- Events from before ip_hash existed are all grouped as one "legacy" source.
create or replace function public.popular_recommendation_ids(
  p_since timestamptz,
  p_min_views int,
  p_limit int,
  p_per_ip_daily_cap int
)
returns table (recommendation_id uuid, views bigint)
language sql
stable
set search_path = public
as $$
  with per_source as (
    select e.recommendation_id,
           coalesce(e.ip_hash, 'legacy') as src,
           date_trunc('day', e.created_at) as day,
           count(*) as n
    from analytics_events e
    where e.event_type = 'view_recommendation'
      and e.recommendation_id is not null
      and e.created_at >= p_since
    group by 1, 2, 3
  )
  select s.recommendation_id, sum(least(s.n, p_per_ip_daily_cap))::bigint as views
  from per_source s
  group by s.recommendation_id
  having sum(least(s.n, p_per_ip_daily_cap)) >= p_min_views
  order by views desc, s.recommendation_id
  limit p_limit;
$$;

revoke all on function public.popular_recommendation_ids(timestamptz, int, int, int) from public, anon, authenticated;
grant execute on function public.popular_recommendation_ids(timestamptz, int, int, int) to service_role;
