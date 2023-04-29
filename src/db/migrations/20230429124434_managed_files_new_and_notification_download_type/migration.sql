-- AlterEnum
ALTER TYPE "NotificationChoices" ADD VALUE 'DOWNLOAD';

-- AlterEnum
ALTER TYPE "PermissionModelChoices" ADD VALUE 'managed_files';

-- CreateTable
CREATE TABLE "managed_files" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "file" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "storage_info" JSONB,
    "type" TEXT NOT NULL DEFAULT 'application',
    "user_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "managed_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "managed_file_id" ON "managed_files"("id");

-- AddForeignKey
ALTER TABLE "managed_files" ADD CONSTRAINT "managed_files_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
