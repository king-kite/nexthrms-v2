import { Prisma } from '@prisma/client';

import prisma from '..';
import { AttendanceType, AttendanceInfoType, ParamsType } from '../../types';
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
					id: true,
					firstName: true,
					lastName: true,
					email: true,
					profile: {
						select: {
							image: {
								select: {
									id: true,
									url: true,
								},
							},
						},
					},
				},
			},
		},
	},
};

export const getAttendanceQuery = ({
	offset,
	limit,
	id,
	from,
	to,
	where = {},
}: ParamsType & {
	id: string;
	where?: Prisma.AttendanceWhereInput;
}): Prisma.AttendanceFindManyArgs => {
	const query: Prisma.AttendanceFindManyArgs = {
		skip: offset,
		take: limit,
		orderBy: {
			date: 'desc' as const,
		},
		where: {
			employeeId: id,
			...where,
		},
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
		where?: Prisma.AttendanceWhereInput;
	}
): Promise<{
	total: number;
	result: AttendanceType[];
}> => {
	const query = getAttendanceQuery(params);

	const [total, result] = await prisma.$transaction([
		prisma.attendance.count({ where: query.where }),
		prisma.attendance.findMany(query),
	]);

	return { total, result: result as unknown as AttendanceType[] };
};

export async function getSingleAttendance(id: string) {
	const data = await prisma.attendance.findUnique({
		where: { id },
		select: attendanceSelectQuery,
	});
	return data as unknown as AttendanceType | null;
}

// ****** Attendance Info/Statistics ******
const selectInfo: Prisma.AttendanceSelect = {
	date: true,
	punchIn: true,
	punchOut: true,
};

export const getAttendanceInfo = async (id: string, _date?: Date | string) => {
	const date = _date
		? typeof _date === 'string'
			? new Date(_date)
			: _date
		: new Date();
	date.setHours(0, 0, 0, 0);

	const [timesheet, timeline, statistics] = await prisma.$transaction([
		prisma.attendance.findFirst({
			where: {
				date,
				employeeId: id,
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

	return {
		timesheet: timesheet as unknown as AttendanceInfoType | null,
		timeline: timeline as unknown as AttendanceInfoType[],
		statistics: statistics as unknown as AttendanceInfoType[],
	};
};

// ****** Attendance Admin ******
export const getAttendanceAdminQuery = ({
	offset,
	limit,
	search,
	from,
	to = new Date(),
	where = {},
}: ParamsType & {
	where?: Prisma.AttendanceWhereInput;
}): Prisma.AttendanceFindManyArgs => {
	const whereQuery: Prisma.AttendanceWhereInput = where;

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
		where: search || (from && to) ? whereQuery : where,
	};

	return query;
};

export const getAttendanceAdmin = async (
	params?: ParamsType & {
		where?: Prisma.AttendanceWhereInput;
	}
): Promise<{
	total: number;
	result: AttendanceType[];
}> => {
	const query = getAttendanceAdminQuery({ ...params });

	const [total, result] = await prisma.$transaction([
		prisma.attendance.count({ where: query.where }),
		prisma.attendance.findMany(query),
	]);

	return { total, result: result as unknown as AttendanceType[] };
};
