/*
  Warnings:

  - You are about to drop the column `storageGeneration` on the `projects_files` table. All the data in the column will be lost.
  - You are about to drop the column `storageName` on the `projects_files` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "notifications" ALTER COLUMN "sender_id" DROP NOT NULL,
ALTER COLUMN "recipient_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "projects_files" DROP COLUMN "storageGeneration",
DROP COLUMN "storageName",
ADD COLUMN     "storageInfo" JSONB;
