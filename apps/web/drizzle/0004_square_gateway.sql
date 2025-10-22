ALTER TABLE "articles" ADD COLUMN "status" varchar(50) DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "verified" boolean DEFAULT false;