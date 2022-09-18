/*
  Warnings:

  - You are about to drop the column `approved` on the `leaves` table. All the data in the column will be lost.
  - You are about to drop the column `approved` on the `overtime` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('APPROVED', 'DENIED', 'EXPIRED', 'PENDING');

-- AlterTable
ALTER TABLE "leaves" DROP COLUMN "approved",
ADD COLUMN     "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "overtime" DROP COLUMN "approved",
ADD COLUMN     "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING';

-- DropEnum
DROP TYPE "LeaveDecisions";
