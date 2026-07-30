-- service_role bypasses RLS but still needs the underlying table-level grants
-- (same root cause as 0003_grants.sql, for the role admin scripts/service
-- code run as). Also set default privileges so future tables in this schema
-- don't hit the same gap again.

grant usage on schema public to service_role;

grant select, insert, update, delete on category_styles to service_role;
grant select, insert, update, delete on map_config to service_role;
grant select, insert, update, delete on recommendations to service_role;

alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated, service_role;
