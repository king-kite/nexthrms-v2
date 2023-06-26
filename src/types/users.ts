import {
	PermissionModelChoices,
	PermissionObjectChoices,
} from '@prisma/client';

import { SuccessResponseType, ValidatorErrorType } from './base';
import { CreateGroupType, CreateUserType } from '../validators/users';

export type {
	CreatePermissionType,
	CreatePermissionCategoryType,
} from '../validators/users';

// Groups Types Start
export type GroupUserType = {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	isActive: boolean;
	profile?: {
		image: {
			id: string;
			url: string;
		} | null;
	} | null;
};

export type GroupType = {
	id: string;
	name: string;
	description?: string | null;
	active: boolean;
	permissions: PermissionType[];
	users: GroupUserType[];
	// _count object will only be available if the group users parameters are used
	_count?: {
		users: number;
	};
};

export type GroupImportQueryType = {
	id?: string;
	name: string;
	description?: string | null;
	active: boolean;
	permissions: string;
};

export type CreateGroupQueryType = CreateGroupType;

export type CreateGroupErrorResponseType = ValidatorErrorType<CreateGroupType>;

export type CreateGroupResponseType = SuccessResponseType<GroupType>;

export type GetGroupsResponseType = SuccessResponseType<{
	total: number;
	result: GroupType[];
}>;
// Groups Types Stop

// Object Permission Types Start
export type ObjectPermissionUserType = Omit<GroupUserType, 'isActive'>;

export type ObjPermGroupType = {
	id: string;
	name: string;
	delete?: boolean;
	edit?: boolean;
	view?: boolean;
};

export interface ObjPermUser extends ObjectPermissionUserType {
	delete?: boolean;
	edit?: boolean;
	view?: boolean;
}

export type ObjectPermissionType = {
	users: ObjectPermissionUserType[];
	permission: PermissionObjectChoices;
	groups: {
		id: string;
		name: string;
	}[];
};

export type ObjectPermissionImportType = {
	model_name: PermissionModelChoices;
	name: string;
	object_id: string;
	permission: PermissionObjectChoices;
	is_user: boolean;
};

export type GetObjectPermissionsResponseType = SuccessResponseType<{
	result: ObjectPermissionType[];
}>;

// Object Permission Types Stop

// Permissions Types Start
export type PermissionType = {
	id: string;
	name: string;
	category?: PermissionCategoryType | null;
	codename: string;
	description?: string | null;
};

export type PermissionImportQueryType = {
	id?: string;
	name: string;
	codename: string;
	description?: string | null;
	category?: string | null;
};

export type PermissionCategoryType = {
	id: string;
	name: string;
};

export type PermissionPrismaModelNameType =
	| 'asset'
	| 'attendance'
	| 'client'
	| 'department'
	| 'employee'
	| 'group'
	| 'holiday'
	| 'job'
	| 'leave'
	| 'managedFile'
	| 'overtime'
	| 'permission'
	| 'permissionCategory'
	| 'project'
	| 'projectFile'
	| 'projectTask'
	| 'projectTaskFollower'
	| 'projectTeam'
	| 'user';

export type GetPermissionsResponseType = SuccessResponseType<{
	total: number;
	result: PermissionType[];
}>;
// Permisssions Types Stop

// Users Types Start
export type UserType = {
	id: string;
	isActive: boolean;
	isAdmin: boolean;
	isEmailVerified: boolean;
	isSuperUser: boolean;
	email: string;
	firstName: string;
	lastName: string;
	client: {
		id: string;
		company: string;
		position: string;
	} | null;
	employee: {
		id: string;
		department?: {
			id: string;
		};
		job?: {
			id: string;
		};
		supervisors: {
			id: string;
		}[];
		leaves: {
			startDate: Date | string;
			endDate: Date | string;
			reason: string;
			type: string;
			approved: boolean;
		}[];
	} | null;
	profile: {
		dob: string | null;
		gender: 'MALE' | 'FEMALE';
		image: {
			id: string;
			url: string;
		} | null;
		address: string | null;
		city: string | null;
		phone: string | null;
		state: string | null;
	} | null;
	createdAt: string;
	updatedAt: string;
};

export type UserGroupType = {
	id: string;
	name: string;
	description?: string;
};

export type UserImportQueryType = {
	id?: string;
	email: string;
	first_name: string;
	last_name: string;
	dob?: Date | string | null;
	gender: 'MALE' | 'FEMALE';
	image?: string | null;
	image_id?: string | null;
	address?: string | null;
	city?: string | null;
	state?: string | null;
	phone?: string | null;
	permissions?: string | null;
	groups?: string | null;
	is_active?: boolean;
	is_admin?: boolean;
	is_superuser?: boolean;
	email_verified?: boolean;
	updated_at?: Date | string;
	created_at?: Date | string;
};

export type CreateUserQueryType = CreateUserType;

export type CreateUserErrorResponseType = Omit<
	ValidatorErrorType<CreateUserType>,
	'client' | 'employee' | 'profile'
> & {
	client?: ValidatorErrorType<CreateUserType['client']>;
	employee?: ValidatorErrorType<CreateUserType['employee']>;
	profile?: ValidatorErrorType<CreateUserType['profile']>;
};

export type CreateUserResponseType = SuccessResponseType<UserType>;

export type GetUsersResponseType = SuccessResponseType<{
	total: number;
	result: UserType[];
	active: number;
	inactive: number;
	on_leave: number;
	employees: number;
	clients: number;
}>;

// Users Types Stop
