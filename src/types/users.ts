import { PaginatedResponseType, SuccessResponseType } from './base';

export type UserType = {
	id: string;
	isActive: boolean;
	isAdmin: boolean;
	isEmailVerified: boolean;
	email: string;
	firstName: string;
	lastName: string;
	client: {
		id: string;
		company: string;
		position: string;
	} | null;
	employee: {
		department: {
			id: string;
			name: string;
		} | null;
		job: {
			id: string;
			name: string;
		} | null;
		dateEmployed: string;
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
	isSuperuser: boolean;
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
	isSuperuser?: string;
	createdAt?: string;
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
