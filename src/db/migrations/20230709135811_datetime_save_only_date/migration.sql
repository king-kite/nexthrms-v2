-- AlterTable
ALTER TABLE "attendance" ALTER COLUMN "date" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "leaves" ALTER COLUMN "start_date" SET DATA TYPE DATE,
ALTER COLUMN "end_date" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "overtime" ALTER COLUMN "date" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "projects" ALTER COLUMN "start_date" SET DATA TYPE DATE,
ALTER COLUMN "end_date" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "projects_tasks" ALTER COLUMN "due_date" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "users_profile" ALTER COLUMN "dob" SET DATA TYPE DATE;
