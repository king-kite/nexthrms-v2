/*
  Warnings:

  - A unique constraint covering the columns `[overtime_id]` on the table `attendance` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "attendance" ADD COLUMN     "overtime_id" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "attendance_overtime_id_key" ON "attendance"("overtime_id");

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_overtime_id_fkey" FOREIGN KEY ("overtime_id") REFERENCES "overtime"("id") ON DELETE SET NULL ON UPDATE CASCADE;
