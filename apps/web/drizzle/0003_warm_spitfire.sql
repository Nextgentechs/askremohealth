-- Add parent_comment_id column to existing comment table
ALTER TABLE "comment" ADD COLUMN IF NOT EXISTS "parent_comment_id" uuid;
--> statement-breakpoint
-- Add foreign key constraint
DO $$ BEGIN
 ALTER TABLE "comment" ADD CONSTRAINT "comment_parent_comment_id_comment_id_fk" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."comment"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;