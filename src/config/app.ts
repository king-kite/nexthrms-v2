import { PermissionPrismaModelNameType } from '../types';

export const ACCESS_TOKEN = process.env.NEXT_PUBLIC_ACCESS_TOKEN
	? process.env.NEXT_PUBLIC_ACCESS_TOKEN
	: 'access';
export const ACCESS_TOKEN_LIFETIME = process.env.NEXT_PUBLIC_ACCESS_TOKEN_LIFETIME
	? +process.env.NEXT_PUBLIC_ACCESS_TOKEN_LIFETIME
	: 60 * 5; // time in seconds (result: 5 mins)
export const REFRESH_TOKEN = process.env.NEXT_PUBLIC_REFRESH_TOKEN
	? process.env.NEXT_PUBLIC_REFRESH_TOKEN
	: 'refresh';
export const REFRESH_TOKEN_LIFETIME = process.env.NEXT_PUBLIC_REFRESH_TOKEN_LIFETIME
	? +process.env.NEXT_PUBLIC_REFRESH_TOKEN_LIFETIME
	: 60 * 60 * 1; // time in seconds (result: 1 hour)

export const DATA_LIFETIME = process.env.NEXT_PUBLIC_DATA_LIFETIME
	? +process.env.NEXT_PUBLIC_DATA_LIFETIME
	: 6000;
export const DEFAULT_PAGINATION_SIZE = 100;
export const DEFAULT_MEDIA_PAGINAITON_SIZE = 1000;
export const DEFAULT_PASSWORD = 'password';
export const isServer = () => (typeof window === undefined ? true : false);

export const MEDIA_URL = 'media/';
export const MEDIA_EXPORT_URL = 'media/exports/';
export const MEDIA_HIDDEN_FILE_NAME = '.hidden_nomedia';
export const MEDIA_PROFILE_URL = 'media/users/profile/';
export const MEDIA_PROJECT_URL = 'media/projects/';

export const NODE_ENV = process.env.NODE_ENV || 'production';

export const SHOW_QUERY_LOG_TIME = process.env.SHOW_QUERY_LOG_TIME
	? Boolean(Number(process.env.SHOW_QUERY_LOG_TIME))
	: false;

export const TITLE = 'Kite Human Resources Management System';

export const models = [
	'assets',
	'attendance',
	'clients',
	'departments',
	'employees',
	'groups',
	'holiday',
	'jobs',
	'leaves',
	'managed_files',
	'overtime',
	'permissions',
	'permission_categories',
	'projects',
	'projects_files',
	'projects_tasks',
	'users',
];

export const prismaModels: PermissionPrismaModelNameType[] = [
	'asset',
	'attendance',
	'client',
	'department',
	'employee',
	'group',
	'holiday',
	'job',
	'leave',
	'managedFile',
	'overtime',
	'permission',
	'permissionCategory',
	'project',
	'projectFile',
	'projectTask',
	'projectTaskFollower',
	'projectTeam',
	'user',
];

export const getPrismaModels = (model: string): PermissionPrismaModelNameType | undefined => {
	const modelName = model.toLowerCase();
	switch (modelName) {
		case 'assets':
			return 'asset';
		case 'attendance':
			return 'attendance';
		case 'clients':
			return 'client';
		case 'deparments':
			return 'department';
		case 'employees':
			return 'employee';
		case 'groups':
			return 'group';
		case 'holiday':
			return 'holiday';
		case 'jobs':
			return 'job';
		case 'leaves':
			return 'leave';
		case 'managed_files':
			return 'managedFile';
		case 'overtime':
			return 'overtime';
		case 'permissions':
			return 'permission';
		case 'permission_categories':
			return 'permissionCategory';
		case 'projects':
			return 'project';
		case 'projects_files':
			return 'projectFile';
		case 'projects_tasks':
			return 'projectTask';
		case 'users':
			return 'user';
		default:
			return undefined;
	}
};
