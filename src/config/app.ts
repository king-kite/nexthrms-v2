import { PermissionModelChoices } from '@prisma/client';

import { PermissionPrismaModelNameType } from '../types';

export const ACCESS_TOKEN = process.env
	.NEXT_PUBLIC_ACCESS_TOKEN 
	? process.env.NEXT_PUBLIC_ACCESS_TOKEN 
	: 'access';
export const ACCESS_TOKEN_LIFETIME = process.env
	.NEXT_PUBLIC_ACCESS_TOKEN_LIFETIME
	? +process.env.NEXT_PUBLIC_ACCESS_TOKEN_LIFETIME
	: 60 * 5; // time in seconds (result: 5 mins)
export const REFRESH_TOKEN = process.env
	.NEXT_PUBLIC_REFRESH_TOKEN 
	? process.env.NEXT_PUBLICK_REFRESH_TOKEN 
	: 'refresh';
export const REFRESH_TOKEN_LIFETIME = process.env
	.NEXT_PUBLIC_REFRESH_TOKEN_LIFETIME
	? +process.env.NEXT_PUBLIC_REFRESH_TOKEN_LIFETIME
	: 60 * 60 * 1; // time in seconds (result: 1 hour)

export const DATA_LIFETIME = process.env.NEXT_PUBLIC_DATA_LIFETIME
	? +process.env.NEXT_PUBLIC_DATA_LIFETIME
	: 6000;
export const DEFAULT_PAGINATION_SIZE = 100;
export const isServer = () => (typeof window === undefined ? true : false);
export const NODE_ENV = process.env.NODE_ENV || 'production';

export const SHOW_QUERY_LOG_TIME = process.env.SHOW_QUERY_LOG_TIME
	? Boolean(Number(process.env.SHOW_QUERY_LOG_TIME))
	: false;

export const TITLE = 'Kite Human Resource Management System';

export const USE_LOCAL_MEDIA_STORAGE = process.env.USE_LOCAL_MEDIA_STORAGE
	? Boolean(Number(process.env.USE_LOCAL_MEDIA_STORAGE))
	: false;

export const models: PermissionModelChoices[] = [
	'assets',
	'attendance',
	'clients',
	'departments',
	'employees',
	'groups',
	'holiday',
	'jobs',
	'leaves',
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

export const getPrismaModels = (
	model: PermissionModelChoices
): PermissionPrismaModelNameType | undefined => {
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
