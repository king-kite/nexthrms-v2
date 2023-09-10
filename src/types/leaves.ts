import { ValidatorErrorType, SuccessResponseType } from './base';
import { LeaveCreateType } from '../validators/leaves';

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
				location: string;
				url: string | null;
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
	type: 'ANNUAL' | 'CASUAL' | 'HOSPITALIZATION' | 'LOP' | 'MATERNITY' | 'PATERNITY' | 'SICK';
	status: 'APPROVED' | 'DENIED' | 'PENDING';
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

export type CreateLeaveQueryType = Omit<LeaveCreateType, 'startDate' | 'endDate'> & {
	startDate: Date | string;
	endDate: Date | string;
};

export type CreateLeaveErrorResponseType = ValidatorErrorType<CreateLeaveQueryType>;
