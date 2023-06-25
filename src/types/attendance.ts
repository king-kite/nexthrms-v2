import { ValidatorErrorType, SuccessResponseType } from './base';
import { AttendanceCreateType as ValidatorAttendanceCreateType } from '../validators/attendance';
export type { AttendanceActionType } from '../validators/attendance';

export type AttendanceType = {
	id: string;
	employee: {
		id: string;
		department: {
			name: string;
		} | null;
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
	};
	date: Date | string;
	punchIn: Date | string;
	punchOut: Date | string | null;
	updatedAt: Date | string;
	overtime?: {
		status: 'APPROVED' | 'DENIED' | 'PENDING';
		hours: number;
		reason: string;
	} | null;
};

export type AttendanceImportQueryType = {
	id?: string;
	employee_id: string;
	date: string;
	punch_in: string;
	punch_out?: string | null;
	updated_at?: string;
};

export type AttendanceInfoType = {
	date: Date | string;
	punchIn: Date | string;
	punchOut?: Date | string;
	overtime?: {
		hours: number;
		status: 'APPROVED' | 'DENIED' | 'PENDING';
	} | null;
};

interface AttendanceCreateType
	extends Omit<ValidatorAttendanceCreateType, 'date' | 'punchIn' | 'punchOut'> {
	date: Date | string;
	punchIn: Date | string;
	punchOut?: Date | string | null;
}

type CreateAttendanceErrorType = ValidatorErrorType<
	Omit<AttendanceCreateType, 'overtime'>
>;
type CreateAttendanceOvertimeType = ValidatorErrorType<
	AttendanceCreateType['overtime']
>;

export type AttendanceCreateErrorType = CreateAttendanceErrorType & {
	overtime?: CreateAttendanceOvertimeType;
};

export type GetAttendanceResponseType = SuccessResponseType<{
	total: number;
	result: AttendanceType[];
}>;

export type GetAttendanceInfoResponseType = SuccessResponseType<{
	timesheet: AttendanceInfoType | null;
	timeline: AttendanceInfoType[];
	statistics: AttendanceInfoType[];
}>;
