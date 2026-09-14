CREATE TABLE "learners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"study_plan_id" uuid,
	"topic" text NOT NULL,
	"quiz_id" text NOT NULL,
	"answers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"outcomes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"correct_count" integer DEFAULT 0 NOT NULL,
	"total_count" integer DEFAULT 0 NOT NULL,
	"next_action" text,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "study_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"topic" text NOT NULL,
	"goal" text NOT NULL,
	"available_minutes" integer NOT NULL,
	"total_minutes" integer NOT NULL,
	"steps" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_study_plan_id_study_plans_id_fk" FOREIGN KEY ("study_plan_id") REFERENCES "public"."study_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_plans" ADD CONSTRAINT "study_plans_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "quiz_attempts_learner_id_idx" ON "quiz_attempts" USING btree ("learner_id");--> statement-breakpoint
CREATE INDEX "study_plans_learner_id_idx" ON "study_plans" USING btree ("learner_id");