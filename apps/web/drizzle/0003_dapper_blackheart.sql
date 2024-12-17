ALTER TABLE "certificate" ALTER COLUMN "issued_by" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "certificate" ALTER COLUMN "issued_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "certificate" ALTER COLUMN "expiry_date" DROP NOT NULL;