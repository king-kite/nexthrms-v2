/*
  Warnings:

  - You are about to drop the `project_files` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `project_task_followers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `project_tasks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `project_team` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "project_files" DROP CONSTRAINT "project_files_project_id_fkey";

-- DropForeignKey
ALTER TABLE "project_files" DROP CONSTRAINT "project_files_uploaded_by_fkey";

-- DropForeignKey
ALTER TABLE "project_task_followers" DROP CONSTRAINT "project_task_followers_employee_id_fkey";

-- DropForeignKey
ALTER TABLE "project_task_followers" DROP CONSTRAINT "project_task_followers_task_id_fkey";

-- DropForeignKey
ALTER TABLE "project_tasks" DROP CONSTRAINT "project_tasks_created_by_fkey";

-- DropForeignKey
ALTER TABLE "project_tasks" DROP CONSTRAINT "project_tasks_project_id_fkey";

-- DropForeignKey
ALTER TABLE "project_team" DROP CONSTRAINT "project_team_employee_id_fkey";

-- DropForeignKey
ALTER TABLE "project_team" DROP CONSTRAINT "project_team_project_id_fkey";

-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "projectLeadersId" UUID,
ADD COLUMN     "projectTeamId" UUID;

-- DropTable
DROP TABLE "project_files";

-- DropTable
DROP TABLE "project_task_followers";

-- DropTable
DROP TABLE "project_tasks";

-- DropTable
DROP TABLE "project_team";

-- CreateTable
CREATE TABLE "projects_files" (
    "id" UUID NOT NULL,
    "file" TEXT NOT NULL,
    "file_type" "ProjectFileType" NOT NULL DEFAULT 'DOCUMENT',
    "name" VARCHAR(255) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "project_id" UUID NOT NULL,
    "uploaded_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects_tasks" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "priority" "ProjectPriority" NOT NULL DEFAULT 'HIGH',
    "due_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" UUID NOT NULL,
    "project_id" UUID NOT NULL,

    CONSTRAINT "projects_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects_tasks_followers" (
    "id" UUID NOT NULL,
    "is_leader" BOOLEAN NOT NULL DEFAULT false,
    "employee_id" UUID NOT NULL,
    "task_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_tasks_followers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "projects_tasks_followers_task_id_employee_id_key" ON "projects_tasks_followers"("task_id", "employee_id");

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_projectTeamId_fkey" FOREIGN KEY ("projectTeamId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_projectLeadersId_fkey" FOREIGN KEY ("projectLeadersId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects_files" ADD CONSTRAINT "projects_files_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects_files" ADD CONSTRAINT "projects_files_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects_tasks" ADD CONSTRAINT "projects_tasks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects_tasks" ADD CONSTRAINT "projects_tasks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects_tasks_followers" ADD CONSTRAINT "projects_tasks_followers_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects_tasks_followers" ADD CONSTRAINT "projects_tasks_followers_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "projects_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
