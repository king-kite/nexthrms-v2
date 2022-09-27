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
	};
	date: Date | string;
	punchIn: Date | string;
	punchOut: Date | string | null;
	updatedAt: Date | string;
	overtime?: {
		status: 'APPROVED' | 'DENIED' | 'PENDING';
		hours: number;
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

export type GetAttendanceResponseType = SuccessResponseType<{
	total: number;
	result: AttendanceType[];
}>;

export type GetAttendanceInfoResponseType = SuccessResponseType<{
	timesheet: AttendanceInfoType | null;
	timeline: AttendanceInfoType[];
	statistics: AttendanceInfoType[];
}>;
