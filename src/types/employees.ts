import { PaginatedResponseType, SuccessResponseType } from './base';

type UserDataType = {
	firstName: string;
	lastName: string;
	email: string;
	profile: {
		image: string;
	} | null;
	isActive: boolean;
};

export type CreateEmployeeQueryType = {
	dateEmployed: string;
	department: string;
	job: string;
	supervisor: string | null;
	user: {
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
	} | null;
	userId: string | null;
};

export type CreateEmployeeErrorResponseType = {
	dateEmployed?: string;
	department?: string;
	job?: string;
	supervisor?: string;
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
	userId?: string;
};

interface EmployeeUserType extends UserDataType {
	id: true;
	profile: {
		dob: string | null;
		gender: 'MALE' | 'FEMALE';
		image: string;
		address: string | null;
		city: string | null;
		phone: string | null;
		state: string | null;
	} | null;
}

export type EmployeeType = {
	id: string;
	dateEmployed: Date | string;
	department: {
		id: string;
		name: string;
		hod: { user: UserDataType } | null;
	} | null;
	job: {
		id: string;
		name: string;
	} | null;
	user: EmployeeUserType;
	supervisor: {
		id: string;
		department: {
			name: string;
		} | null;
		user: UserDataType;
	} | null;
	leaves: {
		startDate: Date | string;
		endDate: Date | string;
		reason: string;
		type: string;
		approved: boolean;
	}[];
};
export type CreateEmployeeResponseType = SuccessResponseType<EmployeeType>;

export interface GetEmployeesResponseType
	extends PaginatedResponseType<EmployeeType[]> {
	total: number;
	result: EmployeeType[];
	active: number;
	inactive: number;
	on_leave: number;
}
