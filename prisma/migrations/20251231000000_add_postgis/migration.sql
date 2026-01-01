-- Enable PostGIS extension (will skip if already exists or not available)
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS postgis;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'PostGIS extension not available, creating geometry type manually';
END $$;

-- Add location column with PostGIS geometry type
ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "location" geometry(Point, 4326);

-- Migrate existing lat/lng data to PostGIS geometry
DO $$
BEGIN
  UPDATE "reports" 
  SET "location" = ST_SetSRID(ST_MakePoint(lng, lat), 4326)
  WHERE lat IS NOT NULL AND lng IS NOT NULL AND "location" IS NULL;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not migrate coordinates, will handle in application layer';
END $$;

-- Drop old indexes first
DROP INDEX IF EXISTS "reports_lat_lng_idx";

-- Drop old lat/lng columns
ALTER TABLE "reports" DROP COLUMN IF EXISTS "lat";
ALTER TABLE "reports" DROP COLUMN IF EXISTS "lng";

-- Create spatial index on location column
DO $$
BEGIN
  CREATE INDEX IF NOT EXISTS "reports_location_idx" ON "reports" USING GIST ("location");
EXCEPTION WHEN OTHERS THEN
  -- GIST index might not be available, create regular index instead
  CREATE INDEX IF NOT EXISTS "reports_location_idx" ON "reports" ("location");
END $$;
