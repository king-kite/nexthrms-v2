/*
  Warnings:

  - You are about to drop the column `created_by` on the `projects` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_created_by_fkey";

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "created_by";
