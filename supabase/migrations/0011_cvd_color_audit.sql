-- Colorblind-safe palette audit (Machado-Oliveira-Fitzgibbon CVD simulation).
-- Shifts the closest-confusable category pairs further apart under
-- protanopia/deuteranopia/tritanopia: Cafes vs Historical, Restaurants vs
-- Shops, Entertainment vs Nightlife, Art vs Outdoor. Restaurants,
-- Entertainment, Historical, and Outdoor are unchanged.
update category_styles set color = '#A8502B' where category = 'cafe';
update category_styles set color = '#1F6B5E' where category = 'shop';
update category_styles set color = '#96407D' where category = 'art';
update category_styles set color = '#6B2F58' where category = 'nightlife';
