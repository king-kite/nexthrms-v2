import { SuccessResponseType } from './base';

type EmployeeType = {
	id: string;
	user: {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
		profile: {
			image: string;
		} | null;
	};
	department: {
		name: string;
	} | null;
	job: {
		name: string;
	} | null;
};

export type OvertimeType = {
	id: string;
	date: Date | string;
	hours: number;
	reason: string;
	type: 'COMPULSORY' | 'HOLIDAY' | 'VOLUNTARY';
	status: 'APPROVED' | 'DENIED' | 'EXPIRED' | 'PENDING';
	updatedAt: Date | string;
	createdAt: Date | string;
	employee: EmployeeType;
	approvedBy: EmployeeType | null;
	createdBy: EmployeeType | null;
};

export type GetAllOvertimeResponseType = SuccessResponseType<{
	approved: number;
	pending: number;
	denied: number;
	total: number;
	result: OvertimeType[];
}>;

export type CreateOvertimeQueryType = {
	employee?: string;
	date: Date | string;
	hours: number;
	reason: string;
	type: 'COMPULSORY' | 'HOLIDAY' | 'VOLUNTARY';
};

export type CreateOvertimeErrorResponseType = {
	type?: string;
	reason?: string;
	hours?: string;
	date?: string;
	employee?: string;
};
