-- Abuse protection, step 2 of 2. Apply AFTER the site that uses the new server
-- routes (/api/events, /api/issue-report) is live -- see 0015_abuse_protection.sql.
--
-- Guest analytics, issue reports, and cart sends are now written only by those
-- server routes (using the service role, which bypasses these policies), so
-- the public database key no longer needs any write access to these tables.
-- Before this, anyone could open the browser tools, copy the public key, and
-- insert unlimited rows (faking "Popular with Guests", filling the database).

drop policy if exists "anon can log analytics events" on analytics_events;
drop policy if exists "anon can submit issue reports" on issue_reports;
drop policy if exists "anon can submit cart sends" on cart_submissions;

revoke all on analytics_events, issue_reports, cart_submissions from anon;
