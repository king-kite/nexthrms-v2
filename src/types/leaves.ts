import { SuccessResponseType } from './base';

type EmployeeType = {
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
	approvedBy: EmployeeType;
	createdBy: EmployeeType;
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

import { DataListType } from './common';

type StatusType = 'approved' | 'denied' | 'expired' | 'not needed' | 'pending';

export type OvertimeType = {
	id: string;
	user: EmployeeType;
	overtime_type: {
		name: string;
		value: string;
	};
	status: StatusType;
	admin_status?: StatusType;
	date: string;
	hours: number;
	reason: string;
	authorized: {
		supervisor: StatusType;
		hod: StatusType;
		hr: StatusType;
		md: StatusType;
	};
	date_updated: string;
	date_requested: string;
};

export interface OvertimeListType extends DataListType {
	approved_count: number;
	denied_count: number;
	pending_count: number;
	results: OvertimeType[];
}

export type OvertimeCreateType = {
	employee?: string;
	overtime_type: string;
	date: string;
	hours: number;
	reason: string;
};

export type OvertimeCreateErrorType = {
	employee?: string;
	overtime_type?: string;
	date?: string;
	hours?: string;
	reason?: string;
};
