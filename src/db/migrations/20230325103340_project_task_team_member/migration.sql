/*
  Warnings:

  - You are about to drop the column `employee_id` on the `projects_tasks_followers` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[task_id,member_id]` on the table `projects_tasks_followers` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `member_id` to the `projects_tasks_followers` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "projects_tasks_followers" DROP CONSTRAINT "projects_tasks_followers_employee_id_fkey";

-- DropIndex
DROP INDEX "project_task_follower_employee_id";

-- DropIndex
DROP INDEX "projects_tasks_followers_task_id_employee_id_key";

-- AlterTable
ALTER TABLE "projects_tasks_followers" DROP COLUMN "employee_id",
ADD COLUMN     "member_id" UUID NOT NULL;

-- CreateIndex
CREATE INDEX "project_team_member_id" ON "projects_tasks_followers"("member_id");

-- CreateIndex
CREATE UNIQUE INDEX "projects_tasks_followers_task_id_member_id_key" ON "projects_tasks_followers"("task_id", "member_id");

-- AddForeignKey
ALTER TABLE "projects_tasks_followers" ADD CONSTRAINT "projects_tasks_followers_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "projects_team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
