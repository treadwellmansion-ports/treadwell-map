-- Lightweight in-house analytics (no third-party account needed) and a
-- guest-to-staff issue-report inbox.

create type analytics_event_type as enum ('view_recommendation', 'search', 'view_toggle');

create table analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type analytics_event_type not null,
  recommendation_id uuid references recommendations(id) on delete set null,
  query text,
  view_mode text,
  created_at timestamptz not null default now()
);

create index analytics_events_type_idx on analytics_events(event_type);
create index analytics_events_recommendation_idx on analytics_events(recommendation_id);
create index analytics_events_created_at_idx on analytics_events(created_at);

alter table analytics_events enable row level security;

-- Anyone (guest kiosk/mobile/embed, unauthenticated) can log an event, but
-- only staff can read them back for the admin analytics view.
create policy "anon can log analytics events"
  on analytics_events for insert
  to anon, authenticated
  with check (true);

create policy "authenticated read analytics events"
  on analytics_events for select
  to authenticated
  using (true);

create table issue_reports (
  id uuid primary key default gen_random_uuid(),
  recommendation_id uuid references recommendations(id) on delete set null,
  recommendation_name text not null,
  message text,
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now()
);

create index issue_reports_status_idx on issue_reports(status);

alter table issue_reports enable row level security;

-- Guests can submit a report but never read the inbox; staff can read/update.
create policy "anon can submit issue reports"
  on issue_reports for insert
  to anon, authenticated
  with check (true);

create policy "authenticated read issue reports"
  on issue_reports for select
  to authenticated
  using (true);

create policy "authenticated update issue reports"
  on issue_reports for update
  to authenticated
  using (true)
  with check (true);

-- Same grant gap as 0003/0004 -- default privileges only cover tables that
-- existed at the time they were set, so new tables need their own grants too.
grant select, insert, update, delete on analytics_events to anon, authenticated, service_role;
grant select, insert, update, delete on issue_reports to anon, authenticated, service_role;
