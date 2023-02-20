/*
  Warnings:

  - A unique constraint covering the columns `[model_name,object_id,permission]` on the table `permissions_objects` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "permissions_objects_model_name_object_id_permission_key" ON "permissions_objects"("model_name", "object_id", "permission");
