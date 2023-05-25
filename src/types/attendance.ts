import { SuccessResponseType } from './base';

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
				image: string;
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

export type AttendanceCreateType = {
	employee: string;
	date: string;
	punchIn: string;
	punchOut?: string;
	overtime?: {
		hours: number;
		reason: string;
	};
};

export type AttendanceCreateErrorType = {
	date?: string;
	employee?: string;
	punchIn?: string;
	punchOut?: string;
	hours?: string;
	reason?: string;
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
