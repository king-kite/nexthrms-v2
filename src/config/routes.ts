export const HOME_PAGE_URL = '/';
export const JOBS_PAGE_URL = '/jobs/';

// Authentication Section
export const LOGIN_PAGE_URL = '/account/login/';
export const PROFILE_PAGE_URL = '/account/profile/';
export const REGISTER_PAGE_URL = '/account/register/';
export const REQUEST_EMAIL_VERIFY_PAGE_URL = '/account/email/verify/';
export const RESET_PASSWORD_PAGE_URL = '/account/password/reset/';

// Clients section
export const CLIENTS_PAGE_URL = '/clients/';
export const CLIENT_PAGE_URL = (slug: string) => `/clients/${slug}/`;

// Employees Section
export const ATTENDANCE_PAGE_URL = '/employees/attendance/';
export const ATTENDANCE_ADMIN_PAGE_URL = '/employees/attendance/admin/';
export const DEPARTMENTS_PAGE_URL = '/employees/departments/';
export const EMPLOYEES_PAGE_URL = '/employees/all/';
export const EMPLOYEE_PAGE_URL = (slug: string) => `/employees/all/${slug}/`;
export const HOLIDAYS_PAGE_URL = `/employees/holidays/`;

// Leaves Section
export const ADMIN_LEAVES_PAGE_URL = '/employees/leaves/admin/';
export const ADMIN_LEAVE_DETAIL_PAGE_URL = (slug: string) =>
	`/employees/leaves/admin/${slug}/`;
export const LEAVES_PAGE_URL = '/employees/leaves/';
export const LEAVE_DETAIL_PAGE_URL = (slug: string) =>
	`/employees/leaves/${slug}/`;

// Overtime Section
export const ADMIN_OVERTIME_PAGE_URL = '/employees/overtime/admin/';
export const ADMIN_OVERTIME_DETAIL_PAGE_URL = (slug: string) =>
	`/employees/overtime/admin/${slug}/`;
export const OVERTIME_PAGE_URL = '/employees/overtime/';
export const OVERTIME_DETAIL_PAGE_URL = (slug: string) =>
	`/employees/overtime/${slug}/`;

// Projects Section
export const PROJECTS_PAGE_URL = '/projects/';
export const PROJECT_PAGE_URL = (slug: string) => `/projects/${slug}/`;
export const PROJECT_TASKS_PAGE_URL = (slug: string) =>
	`/projects/${slug}/tasks/`;
export const PROJECT_TASK_PAGE_URL = (slug: string, id: string = '') =>
	`/projects/${slug}/tasks/${id}/`;
export const PROJECT_TEAM_PAGE_URL = (slug: string) =>
	`/projects/${slug}/team/`;
