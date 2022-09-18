/*
  Warnings:

  - The values [CAUSAL] on the enum `LeaveChoices` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LeaveChoices_new" AS ENUM ('ANNUAL', 'CASUAL', 'HOSPITALIZATION', 'LOP', 'MATERNITY', 'PATERNITY', 'SICK');
ALTER TABLE "leaves" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "leaves" ALTER COLUMN "type" TYPE "LeaveChoices_new" USING ("type"::text::"LeaveChoices_new");
ALTER TYPE "LeaveChoices" RENAME TO "LeaveChoices_old";
ALTER TYPE "LeaveChoices_new" RENAME TO "LeaveChoices";
DROP TYPE "LeaveChoices_old";
ALTER TABLE "leaves" ALTER COLUMN "type" SET DEFAULT 'CASUAL';
COMMIT;

-- AlterTable
ALTER TABLE "leaves" ALTER COLUMN "type" SET DEFAULT 'CASUAL';
