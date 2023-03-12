/*
  Warnings:

  - The values [EXPIRED] on the enum `LeaveStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LeaveStatus_new" AS ENUM ('APPROVED', 'DENIED', 'PENDING');
ALTER TABLE "leaves" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "overtime" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "leaves" ALTER COLUMN "status" TYPE "LeaveStatus_new" USING ("status"::text::"LeaveStatus_new");
ALTER TABLE "overtime" ALTER COLUMN "status" TYPE "LeaveStatus_new" USING ("status"::text::"LeaveStatus_new");
ALTER TYPE "LeaveStatus" RENAME TO "LeaveStatus_old";
ALTER TYPE "LeaveStatus_new" RENAME TO "LeaveStatus";
DROP TYPE "LeaveStatus_old";
ALTER TABLE "leaves" ALTER COLUMN "status" SET DEFAULT 'PENDING';
ALTER TABLE "overtime" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
