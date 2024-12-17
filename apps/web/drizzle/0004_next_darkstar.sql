ALTER TABLE "operating_hours" ADD COLUMN "schedule" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "operating_hours" DROP COLUMN IF EXISTS "day";--> statement-breakpoint
ALTER TABLE "operating_hours" DROP COLUMN IF EXISTS "opening";--> statement-breakpoint
ALTER TABLE "operating_hours" DROP COLUMN IF EXISTS "closing";