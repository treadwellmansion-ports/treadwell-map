-- Widen the guest map north/west to reach the Woodbury Ave / Pease
-- Tradeport corridor -- Whole Foods (~43.0893, -70.7916), the Woodbury Ave
-- Market Basket (~43.0886, -70.7899), and the Newington Walmart
-- (~43.1019, -70.8096) all fall outside the previous box otherwise.
update map_config set
  max_bounds = '[[-70.815, 42.981], [-70.705, 43.107]]'::jsonb
where id = 1;
