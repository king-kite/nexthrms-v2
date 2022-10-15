-- CreateIndex
CREATE INDEX "attendance_id" ON "attendance"("id");

-- CreateIndex
CREATE INDEX "attendance_employee_id" ON "attendance"("employee_id");

-- CreateIndex
CREATE INDEX "client_id" ON "clients"("id");

-- CreateIndex
CREATE INDEX "department_id" ON "departments"("id");

-- CreateIndex
CREATE INDEX "department_name" ON "departments"("name");

-- CreateIndex
CREATE INDEX "employee_id" ON "employees"("id");

-- CreateIndex
CREATE INDEX "employee_department_id" ON "employees"("department_id");

-- CreateIndex
CREATE INDEX "employee_job_id" ON "employees"("job_id");

-- CreateIndex
CREATE INDEX "supervisor_id" ON "employees"("supervisor_id");

-- CreateIndex
CREATE INDEX "holiday_id" ON "holiday"("id");

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
CREATE INDEX "task_id" ON "projects_tasks"("id");

-- CreateIndex
CREATE INDEX "task_name" ON "projects_tasks"("name");

-- CreateIndex
CREATE INDEX "task_project_id" ON "projects_tasks"("project_id");

-- CreateIndex
CREATE INDEX "project_task_follower_task_id" ON "projects_tasks_followers"("task_id");

-- CreateIndex
CREATE INDEX "project_task_follower_employee_id" ON "projects_tasks_followers"("employee_id");

-- CreateIndex
CREATE INDEX "project_team_employee_id" ON "projects_team"("employee_id");

-- CreateIndex
CREATE INDEX "project_team_project_id" ON "projects_team"("project_id");

-- CreateIndex
CREATE INDEX "token_uid" ON "tokens"("uid");

-- CreateIndex
CREATE INDEX "token_token" ON "tokens"("token");

-- CreateIndex
CREATE INDEX "user_id" ON "users"("id");

-- CreateIndex
CREATE INDEX "user_email" ON "users"("email");

-- CreateIndex
CREATE INDEX "profile_id" ON "users_profile"("id");
