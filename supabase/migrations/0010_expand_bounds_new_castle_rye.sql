-- Widen the guest map further east/south to reach Great Island Common in
-- New Castle (~43.0654, -70.7137) and, down the coast, Jenness State Beach
-- in Rye (~42.9857, -70.7615). Odiorne Point and Rye Harbor State Park
-- (both roughly on the coast between the two) also fall inside this box.
-- min_zoom drops further so the much taller box still fits fully zoomed out.
update map_config set
  max_bounds = '[[-70.787, 42.981], [-70.705, 43.088]]'::jsonb,
  min_zoom = 11
where id = 1;
