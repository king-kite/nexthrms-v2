import { PaginatedResponseType, SuccessResponseType } from './base';

// Groups Types Start
export type GroupType = {
	id: string;
	name: string;
	permissions: PermissionType[];
};

export type CreateGroupQueryType = {
	name: string;
	permissions: string[];
};

export type CreateGroupErrorResponseType = {
	name?: string;
	permissions?: string;
};

export type CreateGroupResponseType = SuccessResponseType<GroupType>

export type GetGroupsResponseType = PaginatedResponseType<GroupType[]>;
// Groups Types Stop

// Permissions Types Start
export type PermissionType = {
	id: string;
	name: string;
	category?: PermissionCategoryType | null;
	codename: string;
	description?: string;
};

export type PermissionCategoryType = {
	id: string;
	name: string;
};

export type GetPermissionsResponseType = PaginatedResponseType<
	PermissionType[]
>;
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
		supervisor?: {
			id: string;
		};
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
		image: string;
		address: string | null;
		city: string | null;
		phone: string | null;
		state: string | null;
	} | null;
	createdAt: string;
	updatedAt: string;
};

export type CreateUserQueryType = {
	email: string;
	firstName: string;
	lastName: string;
	profile: {
		phone: string;
		gender: 'MALE' | 'FEMALE';
		image: string;
		address: string;
		state: string;
		city: string;
		dob: string;
	};
	isActive: boolean;
	isAdmin: boolean;
	isEmailVerified: boolean;
	isSuperUser: boolean;
	createdAt: string;

	// Employee Data If Needed
	employee?: {
		dateEmployed: string;
		department: string;
		job: string;
		supervisor?: string;
	};

	// Client Data If Need
	client?: {
		company: string;
		position: string;
	};
};

export type CreateUserErrorResponseType = {
	email?: string;
	firstName?: string;
	lastName?: string;
	phone?: string;
	gender?: string;
	image?: string;
	address?: string;
	state?: string;
	city?: string;
	dob?: string;
	isActive?: string;
	isAdmin?: string;
	isEmailVerified?: string;
	isSuperUser?: string;
	createdAt?: string;

	dateEmployed?: string;
	department?: string;
	job?: string;
	supervisor?: string;

	company?: string;
	position?: string;
};

export type CreateUserResponseType = SuccessResponseType<UserType>;

export interface GetUsersResponseType
	extends PaginatedResponseType<UserType[]> {
	total: number;
	result: UserType[];
	active: number;
	inactive: number;
	on_leave: number;
	employees: number;
	clients: number;
}
// Users Types Stop
