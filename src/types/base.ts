export type ResponseType<T = unknown> = {
	message: string;
	status: 'error' | 'redirect' | 'success';
	data?: T;
};

export type ParamsType = {
	offset?: number;
	limit?: number;
	search?: string;
	from?: Date | string;
	to?: Date | string;
	date?: Date | string;
};

export type UserObjPermType = {
	delete: boolean;
	edit: boolean;
	view: boolean;
};

export type SuccessResponseType<T = unknown> = ResponseType & {
	data: T;
};

export type PaginatedResponseType<T = unknown> = SuccessResponseType<{
	result: T;
	total: number;
}>;

export type ValidatorErrorType<T> = {
	[K in keyof T]?: T[K] extends Date | number
		? string
		: T[K] extends object
		? ValidatorErrorType<T[K]>
		: string;
};

// export type ValidatorErrorType<T> = {
// 	[K in keyof T]?: T[K] extends object ? ValidatorErrorType<T[K]> : string;
// };
export type PermissionModelChoices =
	| 'assets'
	| 'attendance'
	| 'clients'
	| 'departments'
	| 'employees'
	| 'groups'
	| 'holiday'
	| 'jobs'
	| 'leaves'
	| 'managed_files'
	| 'overtime'
	| 'permissions'
	| 'permission_categories'
	| 'projects'
	| 'projects_files'
	| 'projects_tasks'
	| 'users';

export type PermissionObjectChoices = 'VIEW' | 'EDIT' | 'DELETE';
