/*
  Warnings:

  - The `type` column on the `projects_files` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "projects_files" ADD COLUMN     "storageGeneration" TEXT,
ADD COLUMN     "storageName" TEXT,
ADD COLUMN     "storageType" TEXT,
DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'application';

-- DropEnum
DROP TYPE "ProjectFileType";
