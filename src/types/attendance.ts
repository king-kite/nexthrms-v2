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
					location: string;
					url: string | null;
				} | null;
			} | null;
		};
	};
	date: Date | string;
	punchIn: Date | string;
	punchOut: Date | string | null;
	updatedAt: Date | string;
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
	punchOut?: Date | string | null;
	overtime?: {
		id: string;
		hours: number;
	} | null;
};

export type AttendanceCreateType = Omit<
	ValidatorAttendanceCreateType,
	'date' | 'punchIn' | 'punchOut'
> & {
	date: Date | string;
	punchIn: Date | string;
	punchOut?: Date | string | null;
};

export type AttendanceCreateErrorType = ValidatorErrorType<Omit<AttendanceCreateType, 'overtime'>>;

export type GetAttendanceResponseType = SuccessResponseType<{
	total: number;
	result: AttendanceType[];
}>;

export type GetAttendanceInfoResponseType = SuccessResponseType<{
	timesheet: AttendanceInfoType | null;
	timeline: AttendanceInfoType[];
	statistics: AttendanceInfoType[];
}>;
