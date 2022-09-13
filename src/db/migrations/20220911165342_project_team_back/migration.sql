/*
  Warnings:

  - You are about to drop the column `projectLeadersId` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `projectTeamId` on the `employees` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "employees" DROP CONSTRAINT "employees_projectLeadersId_fkey";

-- DropForeignKey
ALTER TABLE "employees" DROP CONSTRAINT "employees_projectTeamId_fkey";

-- AlterTable
ALTER TABLE "employees" DROP COLUMN "projectLeadersId",
DROP COLUMN "projectTeamId";

-- CreateTable
CREATE TABLE "projects_team" (
    "id" UUID NOT NULL,
    "is_leader" BOOLEAN NOT NULL DEFAULT false,
    "employee_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_team_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "projects_team_project_id_employee_id_key" ON "projects_team"("project_id", "employee_id");

-- AddForeignKey
ALTER TABLE "projects_team" ADD CONSTRAINT "projects_team_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects_team" ADD CONSTRAINT "projects_team_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
