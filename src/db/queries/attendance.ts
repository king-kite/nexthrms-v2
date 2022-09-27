import { Attendance, Prisma } from '@prisma/client';

import prisma from '../client';
import { DEFAULT_PAGINATION_SIZE } from '../../config';
import { AttendanceType } from '../../types';
import { getFirstDateOfMonth, getWeekDate } from '../../utils';

type ParamsType = {
	offset?: number;
	limit?: number;
	search?: string;
};

export const attendanceSelectQuery: Prisma.AttendanceSelect = {
	id: true,
	date: true,
	punchIn: true,
	punchOut: true,
	updatedAt: true,
	employee: {
		select: {
			id: true,
			user: {
				select: {
					firstName: true,
					lastName: true,
					email: true,
					profile: {
						select: {
							image: true,
						},
					},
				},
			},
		},
	},
	overtime: {
		select: {
			hours: true,
		},
	},
};

export const getAttendanceQuery = ({
	offset = 0,
	limit = DEFAULT_PAGINATION_SIZE,
	id,
}: ParamsType & {
	id: string;
}): Prisma.AttendanceFindManyArgs => {
	const query: Prisma.AttendanceFindManyArgs = {
		skip: offset,
		take: limit,
		orderBy: {
			date: 'desc' as const,
		},
		where: { employeeId: id },
		select: attendanceSelectQuery,
	};

	return query;
};

export const getAttendance = async (
	params: ParamsType & {
		id: string;
	}
): Promise<{
	total: number;
	result: AttendanceType[] | Attendance[];
}> => {
	const query = getAttendanceQuery({ ...params });

	const [total, result] = await prisma.$transaction([
		prisma.attendance.count({ where: query.where }),
		prisma.attendance.findMany(query),
	]);

	return { total, result };
};

// ****** Attendance Info/Statistics ******
const selectInfo: Prisma.AttendanceSelect = {
	date: true,
	punchIn: true,
	punchOut: true,
	overtime: {
		select: {
			hours: true,
		},
	},
};

export const getAttendanceInfo = async (id: string) => {
	const date = new Date();
	date.setHours(0, 0, 0, 0);

	const [timesheet, timeline, statistics] = await prisma.$transaction([
		prisma.attendance.findUnique({
			where: {
				date_employeeId: {
					date,
					employeeId: id,
				},
			},
			select: selectInfo,
		}),
		prisma.attendance.findMany({
			where: {
				employeeId: id,
				date: {
					gte: getWeekDate(date, 1), // sunday
					lte: getWeekDate(date, 5), // saturday
				},
			},
			select: selectInfo,
		}),
		prisma.attendance.findMany({
			where: {
				employeeId: id,
				date: {
					gte: getFirstDateOfMonth(date),
					lte: date,
				},
			},
			select: selectInfo,
		}),
	]);

	return { timesheet, timeline, statistics };
};
