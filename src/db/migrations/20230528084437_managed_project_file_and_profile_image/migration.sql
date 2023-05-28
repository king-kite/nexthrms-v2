/*
  Warnings:

  - You are about to drop the column `file` on the `managed_files` table. All the data in the column will be lost.
  - You are about to drop the column `file` on the `projects_files` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `projects_files` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `projects_files` table. All the data in the column will be lost.
  - You are about to drop the column `storage_info` on the `projects_files` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `projects_files` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `users_profile` table. All the data in the column will be lost.
  - You are about to drop the column `image_storage_info` on the `users_profile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[file_id]` on the table `projects_files` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[image_file_id]` on the table `users_profile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `file_id` to the `projects_files` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "managed_files" DROP COLUMN "file",
ADD COLUMN     "url" TEXT NOT NULL DEFAULT '/images/default.png',
ALTER COLUMN "type" SET DEFAULT 'image';

-- AlterTable
ALTER TABLE "projects_files" DROP COLUMN "file",
DROP COLUMN "name",
DROP COLUMN "size",
DROP COLUMN "storage_info",
DROP COLUMN "type",
ADD COLUMN     "file_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "users_profile" DROP COLUMN "image",
DROP COLUMN "image_storage_info",
ADD COLUMN     "image_file_id" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "projects_files_file_id_key" ON "projects_files"("file_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_profile_image_file_id_key" ON "users_profile"("image_file_id");

-- AddForeignKey
ALTER TABLE "users_profile" ADD CONSTRAINT "users_profile_image_file_id_fkey" FOREIGN KEY ("image_file_id") REFERENCES "managed_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects_files" ADD CONSTRAINT "projects_files_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "managed_files"("id") ON DELETE CASCADE ON UPDATE CASCADE;
