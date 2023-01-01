-- AlterTable
ALTER TABLE "permissions" ADD COLUMN     "category_id" UUID;

-- CreateTable
CREATE TABLE "permission_categories" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "permission_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "permission_categories_name_key" ON "permission_categories"("name");

-- CreateIndex
CREATE INDEX "permission_category_id" ON "permission_categories"("id");

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "permission_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
