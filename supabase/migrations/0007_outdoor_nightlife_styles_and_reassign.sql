-- Section 5-style default colors for the two new categories, distinct from
-- the existing 6 (checked against the existing muted historical palette).
insert into category_styles (category, color, label) values
  ('outdoor',   '#3E7C7C', 'Outdoor & Waterfront'),
  ('nightlife', '#4B3862', 'Nightlife & Bars');

-- Waterfront/park/scenic/boat-tour recommendations that were only ever
-- filed under Entertainment or Historical because no better category
-- existed yet.
update recommendations set category = 'outdoor'
where name in (
  'Prescott Park',
  'Peirce Island',
  'Four Tree Island',
  'Memorial Bridge',
  'Bow Street Waterfront',
  'Piscataqua River Walk',
  'Harbor Cruises (Isles of Shoals Steamship Co.)',
  'Portsmouth Harbor Cruises',
  'Portsmouth Harbor Trail'
);

-- Bar/taphouse/live-music venues that were filed under Entertainment or
-- Restaurants for lack of a better category.
update recommendations set category = 'nightlife'
where name in (
  'Jimmy''s Jazz & Blues Club',
  'The Press Room',
  'Thirsty Moose Taphouse'
);
