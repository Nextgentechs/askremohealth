ALTER TABLE "appointment" DROP CONSTRAINT "appointment_facility_id_facility_place_id_fk";
--> statement-breakpoint
ALTER TABLE "appointment" DROP COLUMN IF EXISTS "facility_id";