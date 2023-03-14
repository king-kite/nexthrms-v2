import { LeaveType } from '../../types';

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
