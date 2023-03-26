-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "AssetCondition" AS ENUM ('BAD', 'EXCELLENT', 'GOOD');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('APPROVED', 'DENIED', 'PENDING', 'RETURNED');

-- CreateEnum
CREATE TYPE "LeaveChoices" AS ENUM ('ANNUAL', 'CASUAL', 'HOSPITALIZATION', 'LOP', 'MATERNITY', 'PATERNITY', 'SICK');

-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('APPROVED', 'DENIED', 'PENDING');

-- CreateEnum
CREATE TYPE "NotificationChoices" AS ENUM ('LEAVE', 'OVERTIME');

-- CreateEnum
CREATE TYPE "OvertimeChoices" AS ENUM ('COMPULSORY', 'HOLIDAY', 'VOLUNTARY');

-- CreateEnum
CREATE TYPE "PermissionObjectChoices" AS ENUM ('DELETE', 'EDIT', 'VIEW');

-- CreateEnum
CREATE TYPE "PermissionModelChoices" AS ENUM ('assets', 'attendance', 'clients', 'departments', 'employees', 'groups', 'holiday', 'jobs', 'leaves', 'overtime', 'permissions', 'permission_categories', 'projects', 'projects_files', 'projects_tasks', 'users');

-- CreateEnum
CREATE TYPE "ProjectPriority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "VerificationToken" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET');

-- CreateTable
CREATE TABLE "assets" (
    "id" UUID NOT NULL,
    "asset_id" VARCHAR(250) NOT NULL,
    "condition" "AssetCondition" NOT NULL DEFAULT 'GOOD',
    "description" TEXT,
    "model" VARCHAR(150),
    "manufacturer" VARCHAR(150) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "purchase_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "purchase_from" VARCHAR(250) NOT NULL,
    "serial_no" VARCHAR(150) NOT NULL,
    "supplier" VARCHAR(250) NOT NULL,
    "status" "AssetStatus" NOT NULL DEFAULT 'PENDING',
    "warranty" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,
    "user_id" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance" (
    "id" UUID NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "punch_in" TIME NOT NULL,
    "punch_out" TIME,
    "employee_id" UUID NOT NULL,
    "overtime_id" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" UUID NOT NULL,
    "company" VARCHAR(255) NOT NULL,
    "position" VARCHAR(100) NOT NULL,
    "contact_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "hod_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" UUID NOT NULL,
    "department_id" UUID,
    "job_id" UUID,
    "user_id" UUID NOT NULL,
    "date_employed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groups" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(300),
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "holiday" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "holiday_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaves" (
    "id" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "type" "LeaveChoices" NOT NULL DEFAULT 'CASUAL',
    "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
    "employee_id" UUID NOT NULL,
    "created_by" UUID,
    "approved_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leaves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'This is a title',
    "message" TEXT NOT NULL,
    "message_id" UUID,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "type" "NotificationChoices" NOT NULL,
    "sender_id" UUID,
    "recipient_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "overtime" (
    "id" UUID NOT NULL,
    "type" "OvertimeChoices" NOT NULL DEFAULT 'VOLUNTARY',
    "date" TIMESTAMP(3) NOT NULL,
    "hours" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
    "employee_id" UUID NOT NULL,
    "created_by" UUID,
    "approved_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "overtime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "codename" VARCHAR(100) NOT NULL,
    "description" VARCHAR(300),
    "category_id" UUID,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permission_categories" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "permission_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions_objects" (
    "id" UUID NOT NULL,
    "model_name" "PermissionModelChoices" NOT NULL,
    "object_id" UUID NOT NULL,
    "permission" "PermissionObjectChoices" NOT NULL,

    CONSTRAINT "permissions_objects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_profile" (
    "id" UUID NOT NULL,
    "dob" TIMESTAMP(3),
    "image" TEXT NOT NULL DEFAULT '/images/default.png',
    "image_storage_info" JSONB,
    "address" TEXT,
    "city" VARCHAR(20),
    "phone" VARCHAR(20),
    "state" VARCHAR(100),
    "gender" "Gender" NOT NULL DEFAULT 'MALE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "users_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT NOT NULL,
    "initial_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "name" VARCHAR(255) NOT NULL,
    "priority" "ProjectPriority" NOT NULL DEFAULT 'HIGH',
    "rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3) NOT NULL,
    "client_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects_files" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "file" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "storageInfo" JSONB,
    "type" TEXT NOT NULL DEFAULT 'application',
    "project_id" UUID NOT NULL,
    "uploaded_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects_team" (
    "id" UUID NOT NULL,
    "is_leader" BOOLEAN NOT NULL DEFAULT false,
    "employee_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects_tasks" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "priority" "ProjectPriority" NOT NULL DEFAULT 'HIGH',
    "due_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "project_id" UUID NOT NULL,

    CONSTRAINT "projects_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects_tasks_followers" (
    "id" UUID NOT NULL,
    "is_leader" BOOLEAN NOT NULL DEFAULT false,
    "member_id" UUID NOT NULL,
    "task_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_tasks_followers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokens" (
    "id" UUID NOT NULL,
    "uid" TEXT NOT NULL,
    "type" "VerificationToken" NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATE NOT NULL,

    CONSTRAINT "tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(150) NOT NULL DEFAULT '',
    "last_name" VARCHAR(150) NOT NULL DEFAULT '',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_superuser" BOOLEAN NOT NULL DEFAULT false,
    "password" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_supervisor_employees" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_permission_object_groups" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_group_permissions" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_group_users" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_permission_users" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_permission_object_users" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE INDEX "asset_item_id" ON "assets"("id");

-- CreateIndex
CREATE INDEX "asset_user_id" ON "assets"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_overtime_id_key" ON "attendance"("overtime_id");

-- CreateIndex
CREATE INDEX "attendance_id" ON "attendance"("id");

-- CreateIndex
CREATE INDEX "attendance_employee_id" ON "attendance"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "clients_contact_id_key" ON "clients"("contact_id");

-- CreateIndex
CREATE INDEX "client_id" ON "clients"("id");

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "departments_hod_id_key" ON "departments"("hod_id");

-- CreateIndex
CREATE INDEX "department_id" ON "departments"("id");

-- CreateIndex
CREATE INDEX "department_name" ON "departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "employees_user_id_key" ON "employees"("user_id");

-- CreateIndex
CREATE INDEX "employee_id" ON "employees"("id");

-- CreateIndex
CREATE INDEX "employee_department_id" ON "employees"("department_id");

-- CreateIndex
CREATE INDEX "employee_job_id" ON "employees"("job_id");

-- CreateIndex
CREATE UNIQUE INDEX "groups_name_key" ON "groups"("name");

-- CreateIndex
CREATE INDEX "group_id" ON "groups"("id");

-- CreateIndex
CREATE INDEX "holiday_id" ON "holiday"("id");

-- CreateIndex
CREATE UNIQUE INDEX "holiday_name_date_key" ON "holiday"("name", "date");

-- CreateIndex
CREATE UNIQUE INDEX "jobs_name_key" ON "jobs"("name");

-- CreateIndex
CREATE INDEX "job_id" ON "jobs"("id");

-- CreateIndex
CREATE INDEX "job_name" ON "jobs"("name");

-- CreateIndex
CREATE INDEX "leave_id" ON "leaves"("id");

-- CreateIndex
CREATE INDEX "leave_employee_id" ON "leaves"("employee_id");

-- CreateIndex
CREATE INDEX "leave_created_by_id" ON "leaves"("created_by");

-- CreateIndex
CREATE INDEX "notification_recipient_id" ON "notifications"("recipient_id");

-- CreateIndex
CREATE INDEX "notification_sender_id" ON "notifications"("sender_id");

-- CreateIndex
CREATE INDEX "overtime_id" ON "overtime"("id");

-- CreateIndex
CREATE INDEX "overtime_created_by_id" ON "overtime"("created_by");

-- CreateIndex
CREATE INDEX "overtime_employee_id" ON "overtime"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "overtime_date_employee_id_key" ON "overtime"("date", "employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "permissions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_codename_key" ON "permissions"("codename");

-- CreateIndex
CREATE INDEX "permission_id" ON "permissions"("id");

-- CreateIndex
CREATE UNIQUE INDEX "permission_categories_name_key" ON "permission_categories"("name");

-- CreateIndex
CREATE INDEX "permission_category_id" ON "permission_categories"("id");

-- CreateIndex
CREATE INDEX "permission_object_id" ON "permissions_objects"("id");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_objects_model_name_object_id_permission_key" ON "permissions_objects"("model_name", "object_id", "permission");

-- CreateIndex
CREATE UNIQUE INDEX "users_profile_user_id_key" ON "users_profile"("user_id");

-- CreateIndex
CREATE INDEX "profile_id" ON "users_profile"("id");

-- CreateIndex
CREATE UNIQUE INDEX "projects_name_key" ON "projects"("name");

-- CreateIndex
CREATE INDEX "project_id" ON "projects"("id");

-- CreateIndex
CREATE INDEX "project_name" ON "projects"("name");

-- CreateIndex
CREATE INDEX "project_client_id" ON "projects"("client_id");

-- CreateIndex
CREATE INDEX "project_file_project_id" ON "projects_files"("project_id");

-- CreateIndex
CREATE INDEX "project_file_uploaded_by" ON "projects_files"("uploaded_by");

-- CreateIndex
CREATE INDEX "project_team_employee_id" ON "projects_team"("employee_id");

-- CreateIndex
CREATE INDEX "project_team_project_id" ON "projects_team"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "projects_team_project_id_employee_id_key" ON "projects_team"("project_id", "employee_id");

-- CreateIndex
CREATE INDEX "task_id" ON "projects_tasks"("id");

-- CreateIndex
CREATE INDEX "task_name" ON "projects_tasks"("name");

-- CreateIndex
CREATE INDEX "task_project_id" ON "projects_tasks"("project_id");

-- CreateIndex
CREATE INDEX "project_task_follower_task_id" ON "projects_tasks_followers"("task_id");

-- CreateIndex
CREATE INDEX "project_team_member_id" ON "projects_tasks_followers"("member_id");

-- CreateIndex
CREATE UNIQUE INDEX "projects_tasks_followers_task_id_member_id_key" ON "projects_tasks_followers"("task_id", "member_id");

-- CreateIndex
CREATE UNIQUE INDEX "tokens_token_key" ON "tokens"("token");

-- CreateIndex
CREATE INDEX "token_uid" ON "tokens"("uid");

-- CreateIndex
CREATE INDEX "token_token" ON "tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "tokens_uid_token_key" ON "tokens"("uid", "token");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "user_id" ON "users"("id");

-- CreateIndex
CREATE INDEX "user_email" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_supervisor_employees_AB_unique" ON "_supervisor_employees"("A", "B");

-- CreateIndex
CREATE INDEX "_supervisor_employees_B_index" ON "_supervisor_employees"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_permission_object_groups_AB_unique" ON "_permission_object_groups"("A", "B");

-- CreateIndex
CREATE INDEX "_permission_object_groups_B_index" ON "_permission_object_groups"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_group_permissions_AB_unique" ON "_group_permissions"("A", "B");

-- CreateIndex
CREATE INDEX "_group_permissions_B_index" ON "_group_permissions"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_group_users_AB_unique" ON "_group_users"("A", "B");

-- CreateIndex
CREATE INDEX "_group_users_B_index" ON "_group_users"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_permission_users_AB_unique" ON "_permission_users"("A", "B");

-- CreateIndex
CREATE INDEX "_permission_users_B_index" ON "_permission_users"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_permission_object_users_AB_unique" ON "_permission_object_users"("A", "B");

-- CreateIndex
CREATE INDEX "_permission_object_users_B_index" ON "_permission_object_users"("B");

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_overtime_id_fkey" FOREIGN KEY ("overtime_id") REFERENCES "overtime"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_hod_id_fkey" FOREIGN KEY ("hod_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaves" ADD CONSTRAINT "leaves_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaves" ADD CONSTRAINT "leaves_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaves" ADD CONSTRAINT "leaves_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "overtime" ADD CONSTRAINT "overtime_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "overtime" ADD CONSTRAINT "overtime_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "overtime" ADD CONSTRAINT "overtime_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "permission_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_profile" ADD CONSTRAINT "users_profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects_files" ADD CONSTRAINT "projects_files_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects_files" ADD CONSTRAINT "projects_files_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects_team" ADD CONSTRAINT "projects_team_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects_team" ADD CONSTRAINT "projects_team_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects_tasks" ADD CONSTRAINT "projects_tasks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects_tasks_followers" ADD CONSTRAINT "projects_tasks_followers_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "projects_team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects_tasks_followers" ADD CONSTRAINT "projects_tasks_followers_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "projects_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_supervisor_employees" ADD CONSTRAINT "_supervisor_employees_A_fkey" FOREIGN KEY ("A") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_supervisor_employees" ADD CONSTRAINT "_supervisor_employees_B_fkey" FOREIGN KEY ("B") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_permission_object_groups" ADD CONSTRAINT "_permission_object_groups_A_fkey" FOREIGN KEY ("A") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_permission_object_groups" ADD CONSTRAINT "_permission_object_groups_B_fkey" FOREIGN KEY ("B") REFERENCES "permissions_objects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_group_permissions" ADD CONSTRAINT "_group_permissions_A_fkey" FOREIGN KEY ("A") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_group_permissions" ADD CONSTRAINT "_group_permissions_B_fkey" FOREIGN KEY ("B") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_group_users" ADD CONSTRAINT "_group_users_A_fkey" FOREIGN KEY ("A") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_group_users" ADD CONSTRAINT "_group_users_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_permission_users" ADD CONSTRAINT "_permission_users_A_fkey" FOREIGN KEY ("A") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_permission_users" ADD CONSTRAINT "_permission_users_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_permission_object_users" ADD CONSTRAINT "_permission_object_users_A_fkey" FOREIGN KEY ("A") REFERENCES "permissions_objects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_permission_object_users" ADD CONSTRAINT "_permission_object_users_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
