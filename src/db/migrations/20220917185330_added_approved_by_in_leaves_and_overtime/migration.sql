/*
  Warnings:

  - Added the required column `approved_by` to the `overtime` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "leaves" ADD COLUMN     "approved_by" UUID;

-- AlterTable
ALTER TABLE "overtime" ADD COLUMN     "approved_by" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "leaves" ADD CONSTRAINT "leaves_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "overtime" ADD CONSTRAINT "overtime_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
