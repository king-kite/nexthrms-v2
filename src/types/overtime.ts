import { ValidatorErrorType, SuccessResponseType } from './base';
import { OvertimeCreateType } from '../validators/overtime';

type OvertimeChoices = 'COMPULSORY' | 'HOLIDAY' | 'VOLUNTARY';

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

export type OvertimeType = {
	id: string;
	date: Date | string;
	hours: number;
	reason: string;
	type: OvertimeChoices;
	status: 'APPROVED' | 'DENIED' | 'PENDING';
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

export type CreateOvertimeQueryType = OvertimeCreateType;

export type CreateOvertimeErrorResponseType = ValidatorErrorType<CreateOvertimeQueryType>;
