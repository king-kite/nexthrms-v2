export const ACCESS_TOKEN = 'access';
export const ACCESS_TOKEN_LIFETIME = process.env
	.NEXT_PUBLIC_ACCESS_TOKEN_LIFETIME
	? +process.env.NEXT_PUBLIC_ACCESS_TOKEN_LIFETIME
	: 60 * 5; // time in seconds (result: 5 mins)
export const REFRESH_TOKEN = 'refresh';
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

export const TITLE = 'Kite Human Resource Management System';

export const models = [
	'assets',
	'attendance',
	'clients',
	'deparments',
	'employees',
	'groups',
	'holiday',
	'jobs',
	'leaves',
	'overtime',
	'projects',
	'projects_files',
	'projects_tasks',
	'projects_tasks_followers',
	'projects_team',
	'users',
];
