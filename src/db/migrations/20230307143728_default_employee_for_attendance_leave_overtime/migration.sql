-- DropForeignKey
ALTER TABLE "attendance" DROP CONSTRAINT "attendance_employee_id_fkey";

-- DropForeignKey
ALTER TABLE "leaves" DROP CONSTRAINT "leaves_employee_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_recipient_id_fkey";

-- DropForeignKey
ALTER TABLE "overtime" DROP CONSTRAINT "overtime_employee_id_fkey";

-- AlterTable
ALTER TABLE "attendance" ALTER COLUMN "employee_id" SET DEFAULT '12345678-1234-4b89-8c04-789012345678';

-- AlterTable
ALTER TABLE "leaves" ALTER COLUMN "employee_id" SET DEFAULT '12345678-1234-4b89-8c04-789012345678';

-- AlterTable
ALTER TABLE "overtime" ALTER COLUMN "employee_id" SET DEFAULT '12345678-1234-4b89-8c04-789012345678';

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaves" ADD CONSTRAINT "leaves_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "overtime" ADD CONSTRAINT "overtime_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;
