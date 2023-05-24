import { SuccessResponseType } from './base';

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
	supervisors?: string[];
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
	supervisors?: string;
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
	id: string;
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
	createdAt: Date | string;
	updatedAt: Date | string;
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
	supervisors: {
		id: string;
		department: {
			name: string;
		} | null;
		user: UserDataType;
	}[];
	leaves: {
		startDate: Date | string;
		endDate: Date | string;
		reason: string;
		type: string;
		approved: boolean;
	}[];
};

export type EmployeeImportQueryType = {
	id: string;
	department?: string;
	job?: string;
	user_id: string;
	supervisors?: string;
	date_employed?: string;
	updated_at?: string;
	created_at?: string;
};

export type CreateEmployeeResponseType = SuccessResponseType<EmployeeType>;

export type GetEmployeesResponseType = SuccessResponseType<{
	total: number;
	result: EmployeeType[];
	active: number;
	inactive: number;
	on_leave: number;
}>;
