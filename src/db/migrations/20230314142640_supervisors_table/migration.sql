/*
  Warnings:

  - You are about to drop the column `supervisor_id` on the `employees` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "PermissionModelChoices" ADD VALUE 'supervisors';

-- DropForeignKey
ALTER TABLE "employees" DROP CONSTRAINT "employees_supervisor_id_fkey";

-- DropIndex
DROP INDEX "supervisor_id";

-- AlterTable
ALTER TABLE "employees" DROP COLUMN "supervisor_id";

-- CreateTable
CREATE TABLE "supervisors" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supervisors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "supervisor_id" ON "supervisors"("id");

-- AddForeignKey
ALTER TABLE "supervisors" ADD CONSTRAINT "supervisors_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
