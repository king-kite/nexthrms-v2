import { PaginatedResponseType, SuccessResponseType } from './base';

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
					url: string;
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

export type DepartmentImportQueryType = {
	id?: string;
	name: string;
	created_at?: string;
	updated_at?: string;
};

export type CreateDepartmentResponseType = SuccessResponseType<DepartmentType>;

export type GetDepartmentsResponseType = PaginatedResponseType<
	DepartmentType[]
>;
