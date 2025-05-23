/*
  Warnings:

  - You are about to drop the column `creation_ts` on the `annotations` table. All the data in the column will be lost.
  - You are about to drop the column `last_message_time` on the `conversations` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `conversations` table. All the data in the column will be lost.
  - You are about to drop the column `summary` on the `conversations` table. All the data in the column will be lost.
  - You are about to drop the `insights` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `last_active_time` to the `conversations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "insights" DROP CONSTRAINT "insights_user_id_fkey";

-- DropIndex
DROP INDEX "annotations_target_id_target_node_type_idx";

-- DropIndex
DROP INDEX "conversations_user_id_idx";

-- AlterTable
ALTER TABLE "annotations" DROP COLUMN "creation_ts",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "last_modified_ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "conversations" DROP COLUMN "last_message_time",
DROP COLUMN "status",
DROP COLUMN "summary",
ADD COLUMN     "context_summary" TEXT,
ADD COLUMN     "last_active_time" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "insights";

-- CreateTable
CREATE TABLE "derived_artifacts" (
    "artifact_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "artifact_type" TEXT NOT NULL,
    "title" TEXT,
    "content_json" JSONB NOT NULL,
    "user_feedback_score" INTEGER,
    "user_feedback_comment" TEXT,
    "generated_by_agent" TEXT,
    "agent_version" TEXT,
    "generation_parameters" JSONB,
    "source_memory_unit_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "derived_artifacts_pkey" PRIMARY KEY ("artifact_id")
);

-- CreateTable
CREATE TABLE "DerivedArtifactConceptLink" (
    "id" TEXT NOT NULL,
    "derived_artifact_id" TEXT NOT NULL,
    "concept_id" TEXT NOT NULL,
    "relationship_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "DerivedArtifactConceptLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "annotation_concept_links" (
    "annotation_id" TEXT NOT NULL,
    "concept_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "annotation_concept_links_pkey" PRIMARY KEY ("annotation_id","concept_id")
);

-- CreateTable
CREATE TABLE "UserSession" (
    "session_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "device_info" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "last_active_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "Reflection" (
    "reflection_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "memory_unit_id" TEXT,
    "title" TEXT,
    "content_text" TEXT NOT NULL,
    "reflection_type" TEXT NOT NULL DEFAULT 'journal_prompt_response',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reflection_pkey" PRIMARY KEY ("reflection_id")
);

-- CreateTable
CREATE TABLE "OrbState" (
    "orb_state_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "conversation_id" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orb_mood" TEXT,
    "orb_visual_params" JSONB,
    "active_scene_context" TEXT,
    "current_intent" TEXT,
    "metadata" JSONB,

    CONSTRAINT "OrbState_pkey" PRIMARY KEY ("orb_state_id")
);

-- CreateTable
CREATE TABLE "ChallengeTemplate" (
    "challenge_template_id" TEXT NOT NULL,
    "template_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty_level" INTEGER,
    "estimated_duration_days" INTEGER,
    "repeatable" BOOLEAN NOT NULL DEFAULT false,
    "prerequisites_json" JSONB,
    "tasks_json" JSONB NOT NULL,
    "rewards_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChallengeTemplate_pkey" PRIMARY KEY ("challenge_template_id")
);

-- CreateTable
CREATE TABLE "UserChallenge" (
    "user_challenge_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "challenge_template_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completion_time" TIMESTAMP(3),
    "progress_json" JSONB,
    "user_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserChallenge_pkey" PRIMARY KEY ("user_challenge_id")
);

-- CreateIndex
CREATE INDEX "derived_artifacts_user_id_artifact_type_idx" ON "derived_artifacts"("user_id", "artifact_type");

-- CreateIndex
CREATE INDEX "derived_artifacts_user_id_created_at_idx" ON "derived_artifacts"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "derived_artifacts_source_memory_unit_id_idx" ON "derived_artifacts"("source_memory_unit_id");

-- CreateIndex
CREATE INDEX "DerivedArtifactConceptLink_derived_artifact_id_idx" ON "DerivedArtifactConceptLink"("derived_artifact_id");

-- CreateIndex
CREATE INDEX "DerivedArtifactConceptLink_concept_id_idx" ON "DerivedArtifactConceptLink"("concept_id");

-- CreateIndex
CREATE UNIQUE INDEX "DerivedArtifactConceptLink_derived_artifact_id_concept_id_r_key" ON "DerivedArtifactConceptLink"("derived_artifact_id", "concept_id", "relationship_type");

-- CreateIndex
CREATE INDEX "UserSession_user_id_idx" ON "UserSession"("user_id");

-- CreateIndex
CREATE INDEX "UserSession_expires_at_idx" ON "UserSession"("expires_at");

-- CreateIndex
CREATE INDEX "Reflection_user_id_created_at_idx" ON "Reflection"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "Reflection_memory_unit_id_idx" ON "Reflection"("memory_unit_id");

-- CreateIndex
CREATE INDEX "OrbState_user_id_timestamp_idx" ON "OrbState"("user_id", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "OrbState_conversation_id_idx" ON "OrbState"("conversation_id");

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeTemplate_template_name_key" ON "ChallengeTemplate"("template_name");

-- CreateIndex
CREATE INDEX "ChallengeTemplate_category_idx" ON "ChallengeTemplate"("category");

-- CreateIndex
CREATE INDEX "UserChallenge_user_id_status_idx" ON "UserChallenge"("user_id", "status");

-- CreateIndex
CREATE INDEX "UserChallenge_user_id_challenge_template_id_idx" ON "UserChallenge"("user_id", "challenge_template_id");

-- CreateIndex
CREATE INDEX "annotations_user_id_target_id_target_node_type_idx" ON "annotations"("user_id", "target_id", "target_node_type");

-- CreateIndex
CREATE INDEX "conversations_user_id_last_active_time_idx" ON "conversations"("user_id", "last_active_time" DESC);

-- AddForeignKey
ALTER TABLE "derived_artifacts" ADD CONSTRAINT "derived_artifacts_source_memory_unit_id_fkey" FOREIGN KEY ("source_memory_unit_id") REFERENCES "memory_units"("muid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "derived_artifacts" ADD CONSTRAINT "derived_artifacts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DerivedArtifactConceptLink" ADD CONSTRAINT "DerivedArtifactConceptLink_derived_artifact_id_fkey" FOREIGN KEY ("derived_artifact_id") REFERENCES "derived_artifacts"("artifact_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DerivedArtifactConceptLink" ADD CONSTRAINT "DerivedArtifactConceptLink_concept_id_fkey" FOREIGN KEY ("concept_id") REFERENCES "concepts"("concept_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "annotation_concept_links" ADD CONSTRAINT "annotation_concept_links_annotation_id_fkey" FOREIGN KEY ("annotation_id") REFERENCES "annotations"("aid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "annotation_concept_links" ADD CONSTRAINT "annotation_concept_links_concept_id_fkey" FOREIGN KEY ("concept_id") REFERENCES "concepts"("concept_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reflection" ADD CONSTRAINT "Reflection_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reflection" ADD CONSTRAINT "Reflection_memory_unit_id_fkey" FOREIGN KEY ("memory_unit_id") REFERENCES "memory_units"("muid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrbState" ADD CONSTRAINT "OrbState_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrbState" ADD CONSTRAINT "OrbState_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("conversation_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChallenge" ADD CONSTRAINT "UserChallenge_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChallenge" ADD CONSTRAINT "UserChallenge_challenge_template_id_fkey" FOREIGN KEY ("challenge_template_id") REFERENCES "ChallengeTemplate"("challenge_template_id") ON DELETE RESTRICT ON UPDATE CASCADE;
