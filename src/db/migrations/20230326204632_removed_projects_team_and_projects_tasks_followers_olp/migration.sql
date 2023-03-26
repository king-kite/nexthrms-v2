/*
  Warnings:

  - The values [projects_tasks_followers,projects_team] on the enum `PermissionModelChoices` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PermissionModelChoices_new" AS ENUM ('assets', 'attendance', 'clients', 'departments', 'employees', 'groups', 'holiday', 'jobs', 'leaves', 'overtime', 'permissions', 'permission_categories', 'projects', 'projects_files', 'projects_tasks', 'users');
ALTER TABLE "permissions_objects" ALTER COLUMN "model_name" TYPE "PermissionModelChoices_new" USING ("model_name"::text::"PermissionModelChoices_new");
ALTER TYPE "PermissionModelChoices" RENAME TO "PermissionModelChoices_old";
ALTER TYPE "PermissionModelChoices_new" RENAME TO "PermissionModelChoices";
DROP TYPE "PermissionModelChoices_old";
COMMIT;
