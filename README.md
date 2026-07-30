# Treadwell Downtown Portsmouth Recommendation Map

Guest-facing interactive map of curated local recommendations near The Treadwell Mansion (93
Pleasant Street, Portsmouth, NH), plus a staff admin dashboard to manage them. Three guest
surfaces (`/kiosk`, `/map`, `/embed`) share one Supabase-backed dataset and admin dashboard
(`/admin`).

Built with Next.js (App Router) + MapLibre GL JS (`react-map-gl`) + Supabase (Postgres, Storage,
Auth). The map stack is entirely free and keyless:

- **Basemap**: [OpenFreeMap](https://openfreemap.org/) vector tiles -- no account, no API key.
- **Geocoding** (admin "geocode from address"): [Nominatim](https://nominatim.org/) (OpenStreetMap)
  -- no account, no API key.
- **Walking distance/time**: [OSRM](https://project-osrm.org/)'s public routing server -- no
  account, no API key.

All three are shared public/fair-use services, which is fine at this app's scale (one hotel's
downtown map, light traffic). If usage ever needs to grow well beyond that, each one is
self-hostable.

## 1. Create a Supabase project

1. Create a free project at [supabase.com](https://supabase.com).
2. Install the Supabase CLI (`brew install supabase/tap/supabase` on macOS) and run:
   ```bash
   supabase login
   supabase init
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```
   This applies `supabase/migrations/0001_init.sql`, `0002_storage.sql`, and `0003_grants.sql` --
   schema, RLS policies, seed data (6 category colors + default map bounds), the photo storage
   bucket, and the table-level grants Supabase's dashboard normally sets up automatically.
   (Alternatively, paste each migration file into the dashboard's SQL Editor and run them in
   order -- same result, no CLI needed.)
3. Create a staff login: Authentication > Users > Add user (email + password, check "Auto Confirm
   User"). This is what you'll sign into `/admin` with -- there's no separate signup flow by
   design.
4. From Project Settings > API, copy the Project URL, the `anon`/publishable key, and the
   `service_role`/secret key into `.env.local` (see step 2 below). Or run
   `supabase projects api-keys --project-ref <ref> --reveal` to fetch them from the CLI.

## 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in the three Supabase values from step 1. Nothing else is required -- the map, geocoding, and
directions all work with zero config.

## 3. Run it

```bash
npm install
npm run dev
```

- `/` -- links to every surface below
- `/kiosk` -- fullscreen lobby view
- `/map` -- standalone mobile visitor map
- `/embed` -- minimal-chrome view for an `<iframe>` on the Treadwell website
- `/admin` -- staff dashboard (sign in with the user you created in step 1.3)

## Notes

- The Section 4 "Antique Chart" custom map style (custom serif font + paper-grain sprite) is
  intentionally **not** built yet -- the app runs on OpenFreeMap's default "Liberty" style.
  `MapConfig.styleUrl` (editable at `/admin/settings`) is the escape hatch for dropping in a
  custom MapLibre style JSON later without a code deploy -- with MapLibre this can be a
  self-hosted/checked-in style file, no Studio-equivalent account needed at all.
- The Treadwell Mansion's coordinates in `src/lib/constants.ts` (`TREADWELL_ORIGIN`) were geocoded
  via Nominatim for 93 Pleasant Street, Portsmouth, NH.
- The "You Are Here" Treadwell marker is a placeholder gold star-in-circle
  (`src/components/map/TreadwellMarker.tsx`) -- swap in the real brand mark when one is available.
- Nominatim and OSRM's public servers are demo/fair-use instances (roughly: don't hammer them with
  bulk requests). This app only calls them once per recommendation create/edit in `/admin`, which
  is nowhere near their limits.
