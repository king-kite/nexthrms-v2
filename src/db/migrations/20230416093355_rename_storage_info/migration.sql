/*
  Warnings:

  - You are about to drop the column `storageInfo` on the `projects_files` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "projects_files" DROP COLUMN "storageInfo",
ADD COLUMN     "storage_info" JSONB;
