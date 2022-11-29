-- CreateEnum
CREATE TYPE "AssetCondition" AS ENUM ('BAD', 'EXCELLENT', 'GOOD');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('APPROVED', 'DENIED', 'PENDING', 'RETURNED');

-- CreateTable
CREATE TABLE "assets" (
    "id" UUID NOT NULL,
    "asset_id" VARCHAR(250),
    "condition" "AssetCondition" NOT NULL DEFAULT 'GOOD',
    "description" TEXT,
    "model" VARCHAR(150),
    "manufacturer" VARCHAR(150),
    "name" VARCHAR(150) NOT NULL,
    "purchase_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "purchase_from" VARCHAR(250) NOT NULL,
    "serial_no" VARCHAR(150),
    "supplier" VARCHAR(250),
    "status" "AssetStatus" NOT NULL DEFAULT 'PENDING',
    "warranty" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,
    "user_id" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "asset_item_id" ON "assets"("id");

-- CreateIndex
CREATE INDEX "asset_user_id" ON "assets"("user_id");

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
