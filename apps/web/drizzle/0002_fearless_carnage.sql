ALTER TABLE "admin" RENAME TO "admin_users";--> statement-breakpoint
ALTER TABLE "admin_users" DROP CONSTRAINT "admin_phone_unique";--> statement-breakpoint
ALTER TABLE "admin_users" DROP CONSTRAINT "admin_user_id_user_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_phone_unique" UNIQUE("phone");