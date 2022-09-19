/*
  Warnings:

  - A unique constraint covering the columns `[date,employee_id]` on the table `overtime` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "overtime_date_employee_id_key" ON "overtime"("date", "employee_id");
