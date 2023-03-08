-- DropIndex
DROP INDEX "attendance_date_employee_id_key";

-- AlterTable
ALTER TABLE "attendance" ALTER COLUMN "employee_id" SET DEFAULT '12345678-1234-4b89-8c04-789012345678';

-- AlterTable
ALTER TABLE "leaves" ALTER COLUMN "employee_id" SET DEFAULT '12345678-1234-4b89-8c04-789012345678';

-- AlterTable
ALTER TABLE "overtime" ALTER COLUMN "employee_id" SET DEFAULT '12345678-1234-4b89-8c04-789012345678';
