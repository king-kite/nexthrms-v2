import { LeaveStatus, OvertimeChoices } from '@prisma/client';

import { SuccessResponseType } from './base';
import { OvertimeCreateType } from '../validators/overtime';

type EmployeeType = {
	id: string;
	user: {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
		profile: {
			image: {
				id: string;
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

export type OvertimeType = {
	id: string;
	date: Date | string;
	hours: number;
	reason: string;
	type: 'COMPULSORY' | 'HOLIDAY' | 'VOLUNTARY';
	status: 'APPROVED' | 'DENIED' | 'PENDING';
	updatedAt: Date | string;
	createdAt: Date | string;
	employee: EmployeeType;
	approvedBy: EmployeeType | null;
	createdBy: EmployeeType | null;
};

export type OvertimeImportQueryType = {
	id?: string;
	employee_id: string;
	type: OvertimeChoices;
	date: string;
	hours: number;
	reason: string;
	status: LeaveStatus;
	created_by?: string;
	approved_by?: string;
	updated_at?: string;
	created_at?: string;
};

export type GetAllOvertimeResponseType = SuccessResponseType<{
	approved: number;
	pending: number;
	denied: number;
	total: number;
	result: OvertimeType[];
}>;

export type CreateOvertimeQueryType = OvertimeCreateType;

export type CreateOvertimeErrorResponseType = {
	type?: string;
	reason?: string;
	hours?: string;
	date?: string;
	employee?: string;
};
