CREATE TABLE IF NOT EXISTS "appointment_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appointment_id" uuid NOT NULL,
	"url" varchar NOT NULL,
	"path" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "appointment" RENAME COLUMN "notes" TO "patient_notes";--> statement-breakpoint
ALTER TABLE "appointment" ADD COLUMN "doctor_notes" varchar;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "appointment_attachments" ADD CONSTRAINT "appointment_attachments_appointment_id_appointment_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointment"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
