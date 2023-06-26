import { SuccessResponseType, ValidatorErrorType } from './base';
import { CreateEmployeeType } from '../validators/employees';

type UserDataType = {
	firstName: string;
	lastName: string;
	email: string;
	profile: {
		image: {
			id: string;
			url: string;
		} | null;
	} | null;
	isActive: boolean;
};

export type CreateEmployeeQueryType = CreateEmployeeType;

type EmployeeCreateProfileErrorType = ValidatorErrorType<
	EmployeeUserType['profile']
>;

export type CreateEmployeeErrorResponseType =
	ValidatorErrorType<CreateEmployeeType> & {
		user?: ValidatorErrorType<CreateEmployeeType['user']> & {
			profile?: EmployeeCreateProfileErrorType;
		};
	};

interface EmployeeUserType extends UserDataType {
	id: string;
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
	is_hod?: string;
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
