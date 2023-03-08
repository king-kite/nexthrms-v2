import { SuccessResponseType } from './base';

type EmployeeType = {
	id: string;
	user: {
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

export type LeaveType = {
	id: string;
	startDate: Date | string;
	endDate: Date | string;
	reason: string;
	type:
		| 'ANNUAL'
		| 'CASUAL'
		| 'HOSPITALIZATION'
		| 'LOP'
		| 'MATERNITY'
		| 'PATERNITY'
		| 'SICK';
	status: 'APPROVED' | 'DENIED' | 'EXPIRED' | 'PENDING';
	updatedAt: Date | string;
	createdAt: Date | string;
	employee: EmployeeType;
	approvedBy: EmployeeType | null;
	createdBy: EmployeeType | null;
};

export type GetLeavesResponseType = SuccessResponseType<{
	approved: number;
	pending: number;
	denied: number;
	total: number;
	result: LeaveType[];
}>;

export type CreateLeaveQueryType = {
	employee?: string;
	startDate: string;
	endDate: string;
	reason: string;
	type:
		| 'ANNUAL'
		| 'CASUAL'
		| 'HOSPITALIZATION'
		| 'LOP'
		| 'MATERNITY'
		| 'PATERNITY'
		| 'SICK';
};

export type CreateLeaveErrorResponseType = {
	type?: string;
	reason?: string;
	endDate?: string;
	startDate?: string;
	employee?: string;
};
