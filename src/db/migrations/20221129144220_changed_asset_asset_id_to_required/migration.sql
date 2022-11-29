/*
  Warnings:

  - Made the column `asset_id` on table `assets` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "assets" ALTER COLUMN "asset_id" SET NOT NULL;
