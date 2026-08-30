-- Widen the guest map further southwest to reach Portsmouth Country Club
-- and Breakfast Hill Golf Club in Greenland, Target in Greenland, the Pease
-- airport terminal, and Abenaqui Country Club in Rye Beach.
update map_config set
  max_bounds = '[[-70.834, 42.975], [-70.705, 43.107]]'::jsonb
where id = 1;
