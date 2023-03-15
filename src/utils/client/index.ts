import { LeaveType, OvertimeType } from '../../types';

export function serializeLeave(leave: LeaveType): LeaveType & {
	expired: boolean;
} {
	const currentDate = new Date();
	currentDate.setHours(0, 0, 0, 0);
	const startDate =
		typeof leave.startDate === 'string'
			? new Date(leave.startDate)
			: leave.startDate;

	return {
		...leave,
		expired:
			leave.status === 'PENDING'
				? currentDate.getTime() <= startDate.getTime() &&
				  leave.status === 'PENDING'
					? false
					: true
				: false,
	};
}

export function serializeOvertime(overtime: OvertimeType): OvertimeType & {
	expired: boolean;
} {
	const currentDate = new Date();
	currentDate.setHours(0, 0, 0, 0);
	const date =
		typeof overtime.date === 'string' ? new Date(overtime.date) : overtime.date;

	return {
		...overtime,
		expired:
			overtime.status === 'PENDING'
				? currentDate.getTime() <= date.getTime() &&
				  overtime.status === 'PENDING'
					? false
					: true
				: false,
	};
}
