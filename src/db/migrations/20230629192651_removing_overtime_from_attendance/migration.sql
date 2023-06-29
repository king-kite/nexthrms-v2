/*
  Warnings:

  - You are about to drop the column `overtime_id` on the `attendance` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[date,employee_id]` on the table `attendance` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "attendance" DROP CONSTRAINT "attendance_overtime_id_fkey";

-- DropIndex
DROP INDEX "attendance_overtime_id_key";

-- AlterTable
ALTER TABLE "attendance" DROP COLUMN "overtime_id";

-- CreateIndex
CREATE UNIQUE INDEX "attendance_date_employee_id_key" ON "attendance"("date", "employee_id");
