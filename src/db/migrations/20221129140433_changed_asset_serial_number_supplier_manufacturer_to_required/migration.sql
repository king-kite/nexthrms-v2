/*
  Warnings:

  - Made the column `manufacturer` on table `assets` required. This step will fail if there are existing NULL values in that column.
  - Made the column `serial_no` on table `assets` required. This step will fail if there are existing NULL values in that column.
  - Made the column `supplier` on table `assets` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "assets" ALTER COLUMN "manufacturer" SET NOT NULL,
ALTER COLUMN "serial_no" SET NOT NULL,
ALTER COLUMN "supplier" SET NOT NULL;
