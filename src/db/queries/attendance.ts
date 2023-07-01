import { Prisma } from '@prisma/client';

import prisma from '..';
import { AttendanceType, AttendanceInfoType, ParamsType } from '../../types';
import { getDate, getFirstDateOfMonth, getWeekDate } from '../../utils';

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

const xprisma = prisma.$extends({
	name: 'Custom method to add overtime detail to attendance model',
	result: {
		attendance: {
			overtime: {
				needs: { date: true, employeeId: true },
				compute({ date, employeeId }) {
					async function getOvertime() {
						const overtime = await prisma.overtime.findFirst({
							where: {
								date,
								employeeId,
								status: 'APPROVED',
							},
							select: {
								id: true,
								hours: true,
							},
						});
						return overtime;
					}
					return getOvertime();
				},
			},
		},
	},
});

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
	});
	return data as unknown as AttendanceType | null;
}

// ****** Attendance Info/Statistics ******
const selectInfo = {
	date: true,
	punchIn: true,
	punchOut: true,
	overtime: true,
};

export const getAttendanceInfo = async (
	employeeId: string,
	_date?: Date | string
) => {
	const date = _date
		? typeof _date === 'string'
			? new Date(_date)
			: _date
		: new Date();
	date.setHours(0, 0, 0, 0);

	const stats = await xprisma.$transaction([
		xprisma.attendance.findUnique({
			where: {
				date_employeeId: {
					date,
					employeeId,
				},
			},
			select: selectInfo,
		}),
		xprisma.attendance.findMany({
			where: {
				employeeId,
				date: {
					gte: getWeekDate(date, 1),
					lte: getWeekDate(date, 6),
				},
			},
			select: selectInfo,
		}),
		xprisma.attendance.findMany({
			where: {
				employeeId,
				date: {
					gte: getFirstDateOfMonth(date),
					lte: date,
				},
			},
			select: selectInfo,
		}),
	]);

	const { statistics, timeline, timesheet } = await new Promise<{
		timesheet: AttendanceInfoType | null;
		timeline: AttendanceInfoType[];
		statistics: AttendanceInfoType[];
	}>(async (resolve, reject) => {
		try {
			const timesheet = stats[0]
				? {
						...stats[0],
						overtime: await stats[0].overtime,
				  }
				: null;

			// Get the timeline from the statistics
			// timeline is the attendance for the week
			const timeline = await Promise.all(
				stats[1].map(async (stat) => ({
					...stat,
					overtime: await stat.overtime,
				}))
			);

			const statistics = await Promise.all(
				stats[2].map(async (stat) => ({
					...stat,
					overtime: await stat.overtime,
				}))
			);
			resolve({ timeline, timesheet, statistics });
		} catch (error) {
			reject(error);
		}
	});

	return {
		timesheet,
		timeline,
		statistics,
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
