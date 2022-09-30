import { PaginatedResponseType, SuccessResponseType } from './base';

export type DepartmentType = {
	id: string;
	name: string;
	hod: {
		id: string;
		user: {
			firstName: string;
			lastName: string;
			email: string;
			profile: {
				image: string;
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

export type CreateDepartmentResponseType = SuccessResponseType<DepartmentType>;

export type GetDepartmentsResponseType = PaginatedResponseType<
	DepartmentType[]
>;
