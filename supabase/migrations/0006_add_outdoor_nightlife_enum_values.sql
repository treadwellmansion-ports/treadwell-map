-- New enum values must land in their own transaction before anything can
-- reference them (Postgres restriction on ALTER TYPE ... ADD VALUE). The
-- category_styles rows and recommendation reassignments that use these
-- values live in the next migration.

alter type category_enum add value 'outdoor';
alter type category_enum add value 'nightlife';
