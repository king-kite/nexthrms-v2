/*
  Warnings:

  - You are about to drop the `supervisors` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "supervisors" DROP CONSTRAINT "supervisors_employeeId_fkey";

-- DropTable
DROP TABLE "supervisors";

-- CreateTable
CREATE TABLE "_supervisor_employees" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_supervisor_employees_AB_unique" ON "_supervisor_employees"("A", "B");

-- CreateIndex
CREATE INDEX "_supervisor_employees_B_index" ON "_supervisor_employees"("B");

-- AddForeignKey
ALTER TABLE "_supervisor_employees" ADD CONSTRAINT "_supervisor_employees_A_fkey" FOREIGN KEY ("A") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_supervisor_employees" ADD CONSTRAINT "_supervisor_employees_B_fkey" FOREIGN KEY ("B") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
