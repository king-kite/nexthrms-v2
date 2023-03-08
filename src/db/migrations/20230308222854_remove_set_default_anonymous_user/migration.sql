-- DropForeignKey
ALTER TABLE "attendance" DROP CONSTRAINT "attendance_employee_id_fkey";

-- DropForeignKey
ALTER TABLE "leaves" DROP CONSTRAINT "leaves_employee_id_fkey";

-- DropForeignKey
ALTER TABLE "overtime" DROP CONSTRAINT "overtime_employee_id_fkey";

-- AlterTable
ALTER TABLE "attendance" ALTER COLUMN "employee_id" DROP NOT NULL,
ALTER COLUMN "employee_id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "leaves" ALTER COLUMN "employee_id" DROP NOT NULL,
ALTER COLUMN "employee_id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "overtime" ALTER COLUMN "employee_id" DROP NOT NULL,
ALTER COLUMN "employee_id" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaves" ADD CONSTRAINT "leaves_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "overtime" ADD CONSTRAINT "overtime_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
