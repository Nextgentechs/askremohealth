CREATE TABLE IF NOT EXISTS "lab_availability2" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"place_id" varchar NOT NULL,
	"day_of_week" "week_day" NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lab_availability2" ADD CONSTRAINT "lab_availability2_place_id_labs_place_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."labs"("place_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
