-- Table-level grants for the anon/authenticated roles. RLS policies (see
-- 0001_init.sql) still govern which rows are visible/writable -- these
-- grants just let Postgres get past the table-permission check at all.

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on category_styles to anon, authenticated;
grant select, insert, update, delete on map_config to anon, authenticated;
grant select, insert, update, delete on recommendations to anon, authenticated;
