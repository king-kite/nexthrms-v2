/*
  Warnings:

  - You are about to drop the column `created_at` on the `attendance` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[date,employee_id]` on the table `attendance` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "attendance" DROP COLUMN "created_at";

-- CreateIndex
CREATE UNIQUE INDEX "attendance_date_employee_id_key" ON "attendance"("date", "employee_id");
