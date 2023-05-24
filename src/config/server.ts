import {
	PermissionModelChoices,
	PermissionObjectChoices,
} from '@prisma/client';

const ROOT_URL = '/api';

// Authentication and User Personal Information URLs
export const EMAIL_CONFIRM_URL = `${ROOT_URL}/auth/email/confirm/`;
export const EMAIL_RESEND_URL = `${ROOT_URL}/auth/email/resend/`;
export const LOGIN_URL = `${ROOT_URL}/auth/login/`;
export const LOGOUT_URL = `${ROOT_URL}/auth/logout/`;
export const PASSWORD_CHANGE_URL = `${ROOT_URL}/auth/password/change/`;
export const PASSWORD_RESET_URL = `${ROOT_URL}/auth/password/reset/`;
export const PASSWORD_RESET_CONFIRM_URL = `${ROOT_URL}/auth/password/reset/confirm/`;
export const PASSWORD_RESET_VERIFY_URL = `${ROOT_URL}/auth/password/reset/verify/`;
export const PROFILE_URL = `${ROOT_URL}/auth/profile/`;
export const REGISTER_URL = `${ROOT_URL}/auth/register/`;
export const USER_DATA_URL = `${ROOT_URL}/auth/user/`;
export const USER_OBJECT_PERMISSIONS_URL = (
	model: PermissionModelChoices,
	objectId: string,
	permission?: PermissionObjectChoices | ''
) => {
	let url = `${ROOT_URL}/auth/permissions/${model}/${objectId}/`;
	if (permission) url += `?permission=${permission || ''}`;
	return url;
};

export const NOTIFICATIONS_URL = `${ROOT_URL}/notifications/`;
export const NOTIFICATION_URL = (id: number | string) =>
	`${ROOT_URL}/notifications/${id}/`;

// Employees URLs Start
export const ATTENDANCE_URL = `${ROOT_URL}/attendance/`;
export const ATTENDANCE_INFO_URL = `${ROOT_URL}/attendance/info/`;
export const ATTENDANCE_ADMIN_URL = `${ROOT_URL}/attendance/admin/`;
export const ATTENDANCE_ADMIN_EXPORT_URL = `${ROOT_URL}/attendance/admin/export/`;
export const ATTENDANCE_ADMIN_SINGLE_URL = (id: string) =>
	`${ROOT_URL}/attendance/admin/${id}/`;

export const CLIENTS_URL = `${ROOT_URL}/clients/`;
export const CLIENTS_EXPORT_URL = `${ROOT_URL}/clients/export/`;
export const CLIENTS_IMPORT_URL = `${ROOT_URL}/clients/import/`;
export const CLIENT_URL = (id: string) => `${ROOT_URL}/clients/${id}/`;

export const DEPARTMENTS_URL = `${ROOT_URL}/departments/`;
export const DEPARTMENTS_EXPORT_URL = `${ROOT_URL}/departments/export/`;
export const DEPARTMENTS_IMPORT_URL = `${ROOT_URL}/departments/import/`;
export const DEPARTMENT_URL = (id: string) => `${ROOT_URL}/departments/${id}/`;

export const EMPLOYEES_URL = `${ROOT_URL}/employees/`;
export const EMPLOYEES_EXPORT_URL = `${ROOT_URL}/employees/export/`;
export const EMPLOYEES_IMPORT_URL = `${ROOT_URL}/employees/import/`;
export const EMPLOYEE_URL = (id: string) => `${EMPLOYEES_URL}${id}/`;

export const HOLIDAYS_URL = `${ROOT_URL}/holidays/`;
export const HOLIDAYS_EXPORT_URL = `${ROOT_URL}/holidays/export/`;
export const HOLIDAY_URL = (id: string) => `${ROOT_URL}/holidays/${id}/`;

export const LEAVES_URL = `${ROOT_URL}/leaves/all/`;
export const LEAVE_URL = (id: string) => `${LEAVES_URL}${id}/`;

export const LEAVES_ADMIN_URL = `${ROOT_URL}/leaves/admin/`;
export const LEAVE_ADMIN_URL = (id: string) =>
	`${ROOT_URL}/leaves/admin/${id}/`;
export const LEAVES_ADMIN_EXPORT_URL = `${ROOT_URL}/leaves/admin/export/`;

export const OVERTIME_URL = `${ROOT_URL}/overtime/all/`;
export const OVERTIME_DETAIL_URL = (id: string) => `${OVERTIME_URL}${id}/`;

export const OVERTIME_ADMIN_URL = `${ROOT_URL}/overtime/admin/`;
export const OVERTIME_ADMIN_DETAIL_URL = (id: string) =>
	`${ROOT_URL}/overtime/admin/${id}/`;
export const OVERTIME_ADMIN_EXPORT_URL = `${ROOT_URL}/overtime/admin/export/`;

export const PROJECTS_URL = `${ROOT_URL}/projects/`;
export const PROJECTS_EXPORT_URL = `${ROOT_URL}/projects/export/`;
export const PROJECTS_IMPORT_URL = `${ROOT_URL}/projects/import/`;
export const PROJECT_URL = (id: string) => `${ROOT_URL}/projects/${id}/`;
export const PROJECT_TEAM_URL = (id: string) =>
	`${ROOT_URL}/projects/${id}/team/`;
export const PROJECT_TEAM_EXPORT_URL = (id: string) =>
	`${ROOT_URL}/projects/${id}/team/export/`;
export const PROJECT_TEAM_IMPORT_URL = (id: string) =>
	`${ROOT_URL}/projects/${id}/team/import/`;
export const PROJECT_TEAM_MEMBER_URL = (project_id: string, id: string) =>
	`${ROOT_URL}/projects/${project_id}/team/${id}/`;
export const PROJECT_FILES_URL = (id: string) =>
	`${ROOT_URL}/projects/${id}/files/`;
export const PROJECT_FILES_EXPORT_URL = (id: string) =>
	`${ROOT_URL}/projects/${id}/files/export/`;
export const PROJECT_FILES_IMPORT_URL = (id: string) =>
	`${ROOT_URL}/projects/${id}/files/import/`;
export const PROJECT_FILE_URL = (project_id: string, id: string) =>
	`${ROOT_URL}/projects/${project_id}/files/${id}/`;
export const PROJECT_TASKS_URL = (project_id: string) =>
	`${ROOT_URL}/projects/${project_id}/tasks/`;
export const PROJECT_TASKS_EXPORTS_URL = (project_id: string) =>
	`${ROOT_URL}/projects/${project_id}/tasks/export/`;
export const PROJECT_TASKS_IMPORT_URL = (project_id: string) =>
	`${ROOT_URL}/projects/${project_id}/tasks/import/`;
export const PROJECT_TASK_URL = (pid: string, id: string) =>
	`${ROOT_URL}/projects/${pid}/tasks/${id}/`;
export const PROJECT_TASK_FOLLOWERS_URL = (pid: string, id: string) =>
	`${ROOT_URL}/projects/${pid}/tasks/${id}/followers/`;
export const PROJECT_TASK_FOLLOWERS_EXPORT_URL = (pid: string, id: string) =>
	`${ROOT_URL}/projects/${pid}/tasks/${id}/followers/export/`;
export const PROJECT_TASK_FOLLOWERS_IMPORT_URL = (pid: string, id: string) =>
	`${ROOT_URL}/projects/${pid}/tasks/${id}/followers/import/`;
export const PROJECT_TASK_FOLLOWER_URL = (
	pid: string,
	taskId: string,
	id: string
) => `${ROOT_URL}/projects/${pid}/tasks/${taskId}/followers/${id}/`;

// Employees URLs Stop

// Administration URLs Start

export const ASSETS_URL = `${ROOT_URL}/assets/`;
export const ASSETS_EXPORT_URL = `${ROOT_URL}/assets/export/`;
export const ASSETS_IMPORT_URL = `${ROOT_URL}/assets/import/`;
export const ASSET_URL = (id: string) => `${ASSETS_URL}${id}/`;

export const GROUPS_URL = `${ROOT_URL}/groups/`;
export const GROUP_URL = (id: string) => `${GROUPS_URL}${id}/`;
export const GROUPS_EXPORT_URL = `${ROOT_URL}/groups/export/`;
export const GROUPS_IMPORT_URL = `${ROOT_URL}/groups/import/`;

export const JOBS_URL = `${ROOT_URL}/jobs/`;
export const JOB_URL = (id: string) => `${ROOT_URL}/jobs/${id}/`;
export const JOBS_EXPORT_URL = `${ROOT_URL}/jobs/export/`;
export const JOBS_IMPORT_URL = `${ROOT_URL}/jobs/import/`;

type ObjectPermissionType = {
	limit: number;
	offset: number;
	search: string;
};

export const OBJECT_PERMISSIONS_URL = (
	model: PermissionModelChoices,
	objectId: string,
	permission?: PermissionObjectChoices | '',
	groups?: ObjectPermissionType,
	users?: ObjectPermissionType
) => {
	let url = `${ROOT_URL}/permissions/objects/${model}/${objectId}/`;
	url += `?permission=${permission || ''}`;
	if (groups)
		url += `&groupLimit=${groups.limit || ''}&groupOffset=${
			groups.offset || ''
		}&groupSearch=${groups.search || ''}`;
	if (users)
		url += `&userLimit=${users.limit || ''}&userOffset=${
			users.offset || ''
		}&userSearch=${users.search || ''}`;
	return url;
};

export const PERMISSIONS_URL = `${ROOT_URL}/permissions/`;
export const PERMISSION_URL = (id: string) => `${PERMISSIONS_URL}${id}/`;
export const PERMISSIONS_EXPORT_URL = `${ROOT_URL}/permissions/export`;

export const PERMISSION_CATEGORIES_URL = `${ROOT_URL}/permissions/categories/`;
export const PERMISSION_CATEGORY_URL = (id: string) =>
	`${PERMISSION_CATEGORIES_URL}${id}/`;
export const PERMISSION_CATEGORIES_EXPORT_URL = `${ROOT_URL}/permissions/categories/export`;

// Users URLs Start
export const ACTIVATE_USER_URL = `${ROOT_URL}/users/activate/`;
export const CHANGE_USER_PASSWORD_URL = `${ROOT_URL}/users/password/change/`;
export const USERS_URL = `${ROOT_URL}/users/`;
export const USERS_EXPORT_URL = `${ROOT_URL}/users/export/`;
export const USERS_IMPORT_URL = `${ROOT_URL}/users/import/`;
export const USER_URL = (id: string) => `${USERS_URL}${id}/`;
export const USER_GROUPS_URL = (id: string) => `${USERS_URL}${id}/groups`;
export const USER_PERMISSIONS_URL = (id: string) =>
	`${USERS_URL}${id}/permissions/`;

// Administration URLs Stop
