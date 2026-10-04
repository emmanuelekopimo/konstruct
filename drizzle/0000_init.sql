CREATE TABLE "extraction_cache" (
	"file_hash" text PRIMARY KEY NOT NULL,
	"model" text NOT NULL,
	"result" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plan_files" (
	"plan_id" integer PRIMARY KEY NOT NULL,
	"mime" text NOT NULL,
	"bytes" "bytea" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plan_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"plan_id" integer NOT NULL,
	"position" integer NOT NULL,
	"code" text NOT NULL,
	"description" text NOT NULL,
	"quantity" numeric(14, 2) NOT NULL,
	"unit" text NOT NULL,
	"confidence" text NOT NULL,
	"basis" text DEFAULT '' NOT NULL,
	"unit_price" integer,
	"vendor_id" integer
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"building_type" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"floors" integer DEFAULT 1 NOT NULL,
	"bedrooms" integer DEFAULT 0 NOT NULL,
	"floor_area_m2" integer DEFAULT 0 NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"assumptions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"file_name" text NOT NULL,
	"file_hash" text NOT NULL,
	"ai_model" text NOT NULL,
	"sample_key" text,
	"priced_on" date NOT NULL,
	"created_on" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"city" text DEFAULT 'Lagos' NOT NULL,
	"state" text DEFAULT 'Lagos' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendor_prices" (
	"vendor_id" integer NOT NULL,
	"code" text NOT NULL,
	"unit_price" integer NOT NULL,
	"updated_on" date NOT NULL,
	CONSTRAINT "vendor_prices_vendor_id_code_pk" PRIMARY KEY("vendor_id","code")
);
--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"whatsapp" boolean DEFAULT true NOT NULL,
	"area" text NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"rating" numeric(2, 1) NOT NULL,
	"reviews" integer DEFAULT 0 NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"delivers" boolean DEFAULT true NOT NULL,
	"categories" text[] NOT NULL,
	"brands" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "plan_files" ADD CONSTRAINT "plan_files_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_items" ADD CONSTRAINT "plan_items_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_items" ADD CONSTRAINT "plan_items_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_prices" ADD CONSTRAINT "vendor_prices_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "plan_items_plan_idx" ON "plan_items" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "plans_user_idx" ON "plans" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "vendor_prices_code_idx" ON "vendor_prices" USING btree ("code");--> statement-breakpoint
CREATE INDEX "vendors_state_idx" ON "vendors" USING btree ("state");