-- Guest "send my cart" feature: a guest builds a shortlist of
-- recommendations while browsing and sends it to themselves (email today,
-- delivery_method left open for SMS later) plus a staff notification.
-- Writes happen server-side (API route, service role) after re-fetching
-- recommendation details from the DB rather than trusting the client
-- payload; this table is a durable log/audit-trail, not the primary
-- delivery mechanism (that's the two Resend emails sent alongside it).

create table cart_submissions (
  id uuid primary key default gen_random_uuid(),
  guest_email text not null,
  guest_name text,
  delivery_method text not null default 'email' check (delivery_method in ('email', 'sms')),
  -- Every email a guest enters gets logged here regardless of whether the
  -- Resend send itself succeeded (e.g. blocked by Resend's unverified-domain
  -- test-mode restriction) -- staff still want the contact captured so no
  -- guest is lost to a delivery hiccup.
  status text not null default 'sent' check (status in ('sent', 'failed')),
  failure_reason text,
  recommendation_ids uuid[] not null,
  -- Names/addresses at time of send, kept even if a recommendation is later
  -- edited or deleted, so old submissions stay accurate historical records.
  recommendation_snapshot jsonb not null,
  created_at timestamptz not null default now()
);

create index cart_submissions_created_at_idx on cart_submissions(created_at);
create index cart_submissions_status_idx on cart_submissions(status);

alter table cart_submissions enable row level security;

create policy "anon can submit cart sends"
  on cart_submissions for insert
  to anon, authenticated
  with check (true);

create policy "authenticated read cart submissions"
  on cart_submissions for select
  to authenticated
  using (true);

grant select, insert, update, delete on cart_submissions to anon, authenticated, service_role;
