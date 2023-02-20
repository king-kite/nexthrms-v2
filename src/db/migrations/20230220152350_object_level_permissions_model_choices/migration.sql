/*
  Warnings:

  - Changed the type of `model_name` on the `permissions_objects` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PermissionModelChoices" AS ENUM ('assets', 'attendance', 'clients', 'deparments', 'employees', 'groups', 'holiday', 'jobs', 'leaves', 'overtime', 'projects', 'projects_files', 'projects_tasks', 'projects_tasks_followers', 'projects_team', 'users');

-- AlterTable
ALTER TABLE "permissions_objects" DROP COLUMN "model_name",
ADD COLUMN     "model_name" "PermissionModelChoices" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "permissions_objects_model_name_object_id_permission_key" ON "permissions_objects"("model_name", "object_id", "permission");
