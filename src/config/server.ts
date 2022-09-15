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

// Users URLs Start
export const ACTIVATE_USER_URL = `${ROOT_URL}/users/activate/`;
export const CHANGE_USER_PASSWORD_URL = `${ROOT_URL}/users/password/change/`;

export const NOTIFICATIONS_URL = `${ROOT_URL}/notifications/`;
export const NOTIFICATION_URL = (id: number | string) =>
	`${ROOT_URL}/notifications/${id}/`;

// Employees URLs Start
export const ATTENDANCE_URL = `${ROOT_URL}/attendance/`;
export const ATTENDANCE_INFO_URL = `${ROOT_URL}/attendance/info/`;

export const CLIENTS_URL = `${ROOT_URL}/clients/`;
export const CLIENT_URL = (id: string) => `${ROOT_URL}/clients/${id}/`;

export const DEPARTMENTS_URL = `${ROOT_URL}/departments/`;
export const DEPARTMENT_URL = (id: string) => `${ROOT_URL}/departments/${id}/`;

export const EMPLOYEES_URL = `${ROOT_URL}/employees/`;
export const EMPLOYEE_URL = (id: string) => `${EMPLOYEES_URL}${id}/`;
export const EMPLOYEE_DEACTIVATE_URL = `${ROOT_URL}/employees-deactivate/`;
export const EMPLOYEE_PASSWORD_CHANGE_URL = `${ROOT_URL}/employees/password/change/`;
export const EMPLOYEE_EXPORT_URL = (_type: string) =>
	`${ROOT_URL}/employees/export/${_type}/`;

export const HOLIDAYS_URL = `${ROOT_URL}/holidays/`;
export const HOLIDAY_URL = (id: string) => `${ROOT_URL}/holidays/${id}/`;

export const LEAVES_URL = `${ROOT_URL}/leaves/`;
export const LEAVE_DETAIL_URL = (id: string) => `${LEAVES_URL}${id}/`;

export const LEAVES_ADMIN_URL = `${ROOT_URL}/leaves/admin/`;
export const LEAVE_ADMIN_DETAIL_URL = (id: string) =>
	`${ROOT_URL}/leaves/admin/${id}/`;
export const LEAVE_ADMIN_EXPORT_URL = (_type: string) =>
	`${ROOT_URL}/leaves/admin/export/${_type}/`;

export const OVERTIME_URL = `${ROOT_URL}/overtime/`;
export const OVERTIME_DETAIL_URL = (id: string) => `${OVERTIME_URL}${id}/`;

export const OVERTIME_ADMIN_URL = `${ROOT_URL}/overtime/admin/`;
export const OVERTIME_ADMIN_DETAIL_URL = (id: string) =>
	`${ROOT_URL}/overtime/admin/${id}/`;
export const OVERTIME_ADMIN_EXPORT_URL = (_type: string) =>
	`${ROOT_URL}/overtime/admin/export/${_type}/`;

export const PROJECTS_URL = `${ROOT_URL}/projects/`;
export const PROJECT_URL = (id: string) => `${ROOT_URL}/projects/${id}/`;
export const PROJECT_EMPLOYEES_URL = (id: string) =>
	`${ROOT_URL}/projects/${id}/employees/`;
export const PROJECT_FILES_URL = (id: string) =>
	`${ROOT_URL}/projects/${id}/files/`;
export const PROJECT_FILE_URL = (project_id: string, id: string) =>
	`${ROOT_URL}/projects/${project_id}/files/${id}/`;
export const PROJECT_TASKS_URL = (project_id: string) =>
	`${ROOT_URL}/projects/${project_id}/tasks/`;
export const PROJECT_TASK_URL = (pid: string, id: string) =>
	`${ROOT_URL}/projects/${pid}/tasks/${id}/`;
export const PROJECT_TASK_COMPLETED_URL = (pid: string, id: string) =>
	`${ROOT_URL}/projects/${pid}/tasks/${id}/completed/`;

// Employees URLs Stop

export const JOBS_URL = `${ROOT_URL}/jobs/`;
export const JOB_URL = (id: string) => `${ROOT_URL}/jobs/${id}/`;
