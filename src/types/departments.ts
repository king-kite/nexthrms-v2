import { PaginatedResponseType, SuccessResponseType, ValidatorErrorType } from './base';
import { CreateDepartmentType } from '../validators/departments';

export type DepartmentType = {
	id: string;
	name: string;
	updatedAt: Date | string;
	createdAt: Date | string;
	hod: {
		id: string;
		user: {
			id: string;
			firstName: string;
			lastName: string;
			email: string;
			profile: {
				image: {
					id: string;
					location: string;
					url: string | null;
				} | null;
			} | null;
			employee: {
				job: {
					name: string;
				} | null;
			} | null;
		};
	} | null;
	_count: {
		employees: number;
	};
};

export type DepartmentCreateType = CreateDepartmentType;

export type DepartmentCreateErrorType = ValidatorErrorType<DepartmentCreateType>;

export type CreateDepartmentResponseType = SuccessResponseType<DepartmentType>;

export type GetDepartmentsResponseType = PaginatedResponseType<DepartmentType[]>;
