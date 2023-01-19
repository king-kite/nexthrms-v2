import { Attendance, Prisma } from '@prisma/client';

import prisma from '../client';
import { AttendanceType, ParamsType } from '../../types';
import { getFirstDateOfMonth, getWeekDate } from '../../utils';

export const attendanceSelectQuery = {
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
			status: true,
			reason: true,
		},
	},
};

export const getAttendanceQuery = ({
	offset,
	limit,
	id,
	from, 
	to = new Date()
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
	if (from && to && query.where) {
		query.where.date = {
			gte: from,
			lte: to,
		};
	}

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
	const query = getAttendanceQuery(params);

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
			status: true,
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
					gte: getWeekDate(date, 1), // monday
					lte: getWeekDate(date, 6), // saturday
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

// ****** Attendance Admin ******
export const getAttendanceAdminQuery = ({
	offset,
	limit,
	search,
	from,
	to = new Date(),
}: ParamsType): Prisma.AttendanceFindManyArgs => {
	const whereQuery: Prisma.AttendanceWhereInput = {};

	if (search)
		whereQuery.employee = {
			user: {
				OR: [
					{
						firstName: {
							contains: search,
							mode: 'insensitive',
						},
					},
					{
						lastName: {
							contains: search,
							mode: 'insensitive',
						},
					},
					{
						email: {
							contains: search,
							mode: 'insensitive',
						},
					},
				],
			},
		};
	if (from && to) {
		whereQuery.date = {
			gte: from,
			lte: to,
		};
	}
	const query: Prisma.AttendanceFindManyArgs = {
		skip: offset,
		take: limit,
		orderBy: {
			date: 'desc' as const,
		},
		select: attendanceSelectQuery,
		where: search || (from && to) ? whereQuery : undefined,
	};

	return query;
};

export const getAttendanceAdmin = async (
	params?: ParamsType
): Promise<{
	total: number;
	result: AttendanceType[] | Attendance[];
}> => {
	const query = getAttendanceAdminQuery({ ...params });

	const [total, result] = await prisma.$transaction([
		prisma.attendance.count({ where: query.where }),
		prisma.attendance.findMany(query),
	]);

	return { total, result };
};
