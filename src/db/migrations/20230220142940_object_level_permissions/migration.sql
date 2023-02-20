-- CreateEnum
CREATE TYPE "PermissionChoices" AS ENUM ('CREATE', 'DELETE', 'EDIT', 'VIEW');

-- CreateTable
CREATE TABLE "permissions_objects" (
    "id" UUID NOT NULL,
    "model_name" VARCHAR(100) NOT NULL,
    "object_id" UUID NOT NULL,
    "permission" "PermissionChoices" NOT NULL,

    CONSTRAINT "permissions_objects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_permission_object_groups" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_permission_object_users" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE INDEX "permission_object_id" ON "permissions_objects"("id");

-- CreateIndex
CREATE UNIQUE INDEX "_permission_object_groups_AB_unique" ON "_permission_object_groups"("A", "B");

-- CreateIndex
CREATE INDEX "_permission_object_groups_B_index" ON "_permission_object_groups"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_permission_object_users_AB_unique" ON "_permission_object_users"("A", "B");

-- CreateIndex
CREATE INDEX "_permission_object_users_B_index" ON "_permission_object_users"("B");

-- AddForeignKey
ALTER TABLE "_permission_object_groups" ADD CONSTRAINT "_permission_object_groups_A_fkey" FOREIGN KEY ("A") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_permission_object_groups" ADD CONSTRAINT "_permission_object_groups_B_fkey" FOREIGN KEY ("B") REFERENCES "permissions_objects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_permission_object_users" ADD CONSTRAINT "_permission_object_users_A_fkey" FOREIGN KEY ("A") REFERENCES "permissions_objects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_permission_object_users" ADD CONSTRAINT "_permission_object_users_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
