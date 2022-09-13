/*
  Warnings:

  - You are about to drop the column `created_by` on the `projects_tasks` table. All the data in the column will be lost.
  - You are about to drop the column `verified` on the `projects_tasks` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "projects_tasks" DROP CONSTRAINT "projects_tasks_created_by_fkey";

-- AlterTable
ALTER TABLE "projects_tasks" DROP COLUMN "created_by",
DROP COLUMN "verified";
