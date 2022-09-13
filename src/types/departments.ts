import { PaginatedResponseType, SuccessResponseType } from './base';
import { DataListType } from './common';
import { UserEmployeeType } from './employees';

export type _DepartmentType = {
	name: string;
	id: string;
	hod?: UserEmployeeType;
	no_of_employees?: number;
};

export type DepartmentCreateType = {
	name: string;
	hod?: {
		id: string;
	};
};

export interface GetDepartmentsDataType extends DataListType {
	results: _DepartmentType[];
}

// /////

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
