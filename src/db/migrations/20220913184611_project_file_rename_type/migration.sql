/*
  Warnings:

  - You are about to drop the column `file_type` on the `projects_files` table. All the data in the column will be lost.
  - Added the required column `size` to the `projects_files` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "projects_files" DROP COLUMN "file_type",
ADD COLUMN     "size" BIGINT NOT NULL,
ADD COLUMN     "type" "ProjectFileType" NOT NULL DEFAULT 'DOCUMENT';
