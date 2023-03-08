import { SuccessResponseType } from './base';

export type AttendanceType = {
	id: string;
	employee: {
		id: string;
		user: {
			firstName: string;
			lastName: string;
			email: string;
			profile: {
				image: string;
			} | null;
		};
	} | null;
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
