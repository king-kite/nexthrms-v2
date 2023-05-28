import { LeaveChoices, LeaveStatus } from '@prisma/client';

import { SuccessResponseType } from './base';

type EmployeeType = {
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
	status: 'APPROVED' | 'DENIED' | 'PENDING';
	updatedAt: Date | string;
	createdAt: Date | string;
	employee: EmployeeType;
	approvedBy: EmployeeType | null;
	createdBy: EmployeeType | null;
};

export type LeaveImportQueryType = {
	id?: string;
	reason: string;
	start_date: string;
	end_date: string;
	type: LeaveChoices;
	status: LeaveStatus;
	employee_id: string;
	created_by?: string;
	approved_by?: string;
	created_at?: string;
	updated_at?: string;
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
