-- Widen the guest map's pannable area so it reaches two landmarks guests
-- asked to see: the US Route 1 Bypass (west edge, near the Portsmouth
-- Traffic Circle) and the USS Albacore Museum (north edge, ~43.0826,
-- -70.7662). Also drops min_zoom by one level so the larger box can still
-- be seen fully zoomed out. East/south edges and center are untouched
-- (already tuned separately via the admin MapConfig editor).
update map_config set
  max_bounds = '[[-70.787, 43.068], [-70.734, 43.088]]'::jsonb,
  min_zoom = 13
where id = 1;
