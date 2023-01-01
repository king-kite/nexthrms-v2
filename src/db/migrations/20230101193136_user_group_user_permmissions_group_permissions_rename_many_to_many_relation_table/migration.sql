/*
  Warnings:

  - You are about to drop the `_GroupToPermission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_GroupToUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_PermissionToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_GroupToPermission" DROP CONSTRAINT "_GroupToPermission_A_fkey";

-- DropForeignKey
ALTER TABLE "_GroupToPermission" DROP CONSTRAINT "_GroupToPermission_B_fkey";

-- DropForeignKey
ALTER TABLE "_GroupToUser" DROP CONSTRAINT "_GroupToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_GroupToUser" DROP CONSTRAINT "_GroupToUser_B_fkey";

-- DropForeignKey
ALTER TABLE "_PermissionToUser" DROP CONSTRAINT "_PermissionToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_PermissionToUser" DROP CONSTRAINT "_PermissionToUser_B_fkey";

-- DropTable
DROP TABLE "_GroupToPermission";

-- DropTable
DROP TABLE "_GroupToUser";

-- DropTable
DROP TABLE "_PermissionToUser";

-- CreateTable
CREATE TABLE "_group_permissions" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_group_users" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_permission_users" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_group_permissions_AB_unique" ON "_group_permissions"("A", "B");

-- CreateIndex
CREATE INDEX "_group_permissions_B_index" ON "_group_permissions"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_group_users_AB_unique" ON "_group_users"("A", "B");

-- CreateIndex
CREATE INDEX "_group_users_B_index" ON "_group_users"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_permission_users_AB_unique" ON "_permission_users"("A", "B");

-- CreateIndex
CREATE INDEX "_permission_users_B_index" ON "_permission_users"("B");

-- AddForeignKey
ALTER TABLE "_group_permissions" ADD CONSTRAINT "_group_permissions_A_fkey" FOREIGN KEY ("A") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_group_permissions" ADD CONSTRAINT "_group_permissions_B_fkey" FOREIGN KEY ("B") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_group_users" ADD CONSTRAINT "_group_users_A_fkey" FOREIGN KEY ("A") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_group_users" ADD CONSTRAINT "_group_users_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_permission_users" ADD CONSTRAINT "_permission_users_A_fkey" FOREIGN KEY ("A") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_permission_users" ADD CONSTRAINT "_permission_users_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
