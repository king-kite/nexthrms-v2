/*
  Warnings:

  - A unique constraint covering the columns `[employeeId]` on the table `supervisors` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "supervisors_employeeId_key" ON "supervisors"("employeeId");
