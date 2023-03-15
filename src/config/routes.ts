// Administration Section
export const DOCS_PAGE_URL = '/docs/';
export const HOME_PAGE_URL = '/';
export const JOBS_PAGE_URL = '/jobs/';

// Assets Section
export const ASSETS_PAGE_URL = '/assets/';
export const ASSET_OBJECT_PERMISSIONS_PAGE_URL = (slug: string) =>
	`/assets/${slug}/assets/object-permissions/`;

export const GROUPS_PAGE_URL = '/users/groups/';
export const GROUP_PAGE_URL = (slug: string) => `/users/groups/${slug}/`;
export const GROUP_OBJECT_PERMISSIONS_PAGE_URL = (slug: string) =>
	`/users/groups/${slug}/groups/object-permissions/`;
export const OBJECT_PERMISSIONS_PAGE_URL = (
	model: string,
	objectId: string = ''
) => `/users/permissions/objects/${model}/${objectId}/`;
export const PERMISSIONS_PAGE_URL = '/users/permissions/';
export const PERMISSION_OBJECT_PERMISSIONS_PAGE_URL = (slug: string) =>
	`/users/permissions/${slug}/permissions/object-permissions/`;
export const USERS_PAGE_URL = '/users/all/';
export const USER_PAGE_URL = (slug: string) => `/users/all/${slug}/`;
export const USER_OBJECT_PERMISSIONS_PAGE_URL = (slug: string) =>
	`/users/all/${slug}/users/object-permissions/`;

// Authentication Section
export const LOGIN_PAGE_URL = '/account/login/';
export const PROFILE_PAGE_URL = '/account/profile/';
export const REGISTER_PAGE_URL = '/account/register/';
export const REQUEST_EMAIL_VERIFY_PAGE_URL = '/account/email/verify/';
export const CONFIRM_EMAIL_PAGE_URL = (uid: string, token: string = '') =>
	`/account/email/confirm/${uid}/${token}/`;
export const RESET_PASSWORD_PAGE_URL = '/account/password/reset/';
export const RESET_PASSWORD_CONFIRM_PAGE_URL = (
	uid: string,
	token: string = ''
) => `/account/password/reset/confirm/${uid}/${token}/`;

// Clients section
export const CLIENTS_PAGE_URL = '/clients/';
export const CLIENT_PAGE_URL = (slug: string) => `/clients/${slug}/`;
export const CLIENT_OBJECT_PERMISSIONS_PAGE_URL = (slug: string) =>
	`/clients/${slug}/clients/object-permissions/`;

// Employees Section
export const ATTENDANCE_PAGE_URL = '/employees/attendance/';
export const ATTENDANCE_ADMIN_PAGE_URL = '/employees/attendance/admin/';
export const DEPARTMENTS_PAGE_URL = '/employees/departments/';
export const DEPARTMENT_OBJECT_PERMISSIONS_PAGE_URL = (slug: string) =>
	`/employees/departments/${slug}/departments/object-permissions/`;
export const EMPLOYEES_PAGE_URL = '/employees/all/';
export const EMPLOYEE_PAGE_URL = (slug: string) => `/employees/all/${slug}/`;
export const EMPLOYEE_OBJECT_PERMISSIONS_PAGE_URL = (slug: string) =>
	`/employees/all/${slug}/employees/object-permissions/`;
export const HOLIDAYS_PAGE_URL = `/employees/holidays/`;
export const HOLIDAY_OBJECT_PERMISSIONS_PAGE_URL = (slug: string) =>
	`/employees/holidays/${slug}/holidays/object-permissions/`;

// Leaves Section
export const ADMIN_LEAVES_PAGE_URL = '/employees/leaves/admin/';
export const ADMIN_LEAVE_DETAIL_PAGE_URL = (slug: string) =>
	`/employees/leaves/admin/${slug}/`;
export const ADMIN_LEAVE_OBJECT_PERMISSION_PAGE_URL = (id: string) =>
	`/employees/leaves/admin/${id}/leaves/object-permissions/`;
export const LEAVES_PAGE_URL = '/employees/leaves/';
export const LEAVE_DETAIL_PAGE_URL = (slug: string) =>
	`/employees/leaves/${slug}/`;

// Overtime Section
export const ADMIN_OVERTIME_PAGE_URL = '/employees/overtime/admin/';
export const ADMIN_OVERTIME_DETAIL_PAGE_URL = (slug: string) =>
	`/employees/overtime/admin/${slug}/`;
export const ADMIN_OVERTIME_OBJECT_PERMISSION_PAGE_URL = (id: string) =>
	`/employees/overtime/admin/${id}/overtime/object-permissions/`;
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
