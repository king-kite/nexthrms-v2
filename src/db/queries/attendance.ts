import { Attendance, Prisma, Employee } from '@prisma/client';

import defaultPrisma from '..';
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

const prisma = defaultPrisma.$extends({
	name: 'Custom method to add overtime detail to attendance model',
	model: {
		attendance: {
			// Get attendance for an employee with overtime if fonud
			async findUniqueWithOvertime(
				params: {
					id?: Attendance['id'];
					date?: Attendance['date'];
					employeeId?: Employee['id'];
				},
				select?: Prisma.AttendanceSelect
			) {
				let where: Prisma.AttendanceWhereUniqueInput | null = null;
				if (params.id)
					where = {
						id: params.id,
					};
				else if (params.date && params.employeeId)
					where = {
						date_employeeId: {
							date: params.date,
							employeeId: params.employeeId,
						},
					};
				if (!where)
					throw new Error(
						'Please provide an id or a date and employeeId field.'
					);

				const attendance = await prisma.attendance.findUnique({
					where,
					select: select || attendanceSelectQuery,
				});

				if (attendance && (attendance.employee?.id || params.employeeId)) {
					const overtime = await prisma.overtime.findFirst({
						where: {
							date: attendance.date,
							employeeId: attendance.employee?.id || params.employeeId,
							status: 'APPROVED',
						},
						select: {
							id: true,
							status: true,
						},
					});
					return {
						overtime,
						...attendance,
					};
				}

				return attendance;
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
	const data = await prisma.attendance.findUnique({ id });
	return data as unknown as AttendanceType | null;
}

// ****** Attendance Info/Statistics ******
const selectInfo: Prisma.AttendanceSelect = {
	date: true,
	punchIn: true,
	punchOut: true,
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

	const [timesheet, statistics] = await Promise.all([
		prisma.attendance.findUniqueWithOvertime(
			{
				date,
				employeeId,
			},
			selectInfo
		),
		prisma.attendance.findMany({
			where: {
				employeeId,
				date: {
					gte: getFirstDateOfMonth(date),
					lte: date,
				},
			},
			select: selectInfo,
		}) as unknown as AttendanceInfoType[],
	]);

	// Get the timeline from the statistics
	// timeline is the attendance for the week
	const timeline = statistics.reduce(
		(acc: AttendanceInfoType[], attendance) => {
			const monday = getWeekDate(date, 1).getTime();
			const saturday = getWeekDate(date, 6).getTime();
			const attendTime = (getDate(attendance.date) as Date).getTime();

			if (attendTime >= monday && attendTime <= saturday)
				return [...acc, attendance];
			return acc;
		},
		[]
	);

	return {
		timesheet: timesheet as unknown as AttendanceInfoType | null,
		timeline: timeline,
		statistics: statistics as unknown as AttendanceInfoType[],
	};
};

// export const getAttendanceInfo = async (id: string, _date?: Date | string) => {
// 	const date = _date
// 		? typeof _date === 'string'
// 			? new Date(_date)
// 			: _date
// 		: new Date();
// 	date.setHours(0, 0, 0, 0);

// 	const [timesheet, [timeline, statistics]] = await Promise.all([
// 		prisma.attendance.findUniqueWithOvertime({
// 			date,
// 			employeeId: id,
// 		}, selectInfo),
// 		prisma.$transaction([
// 			prisma.attendance.findMany({
// 				where: {
// 					employeeId: id,
// 					date: {
// 						gte: getWeekDate(date, 1), // monday
// 						lte: getWeekDate(date, 6), // saturday
// 					},
// 				},
// 				select: selectInfo,
// 			}),
// 			prisma.attendance.findMany({
// 				where: {
// 					employeeId: id,
// 					date: {
// 						gte: getFirstDateOfMonth(date),
// 						lte: date,
// 					},
// 				},
// 				select: selectInfo,
// 			}),
// 		])
// 	])

// 	return {
// 		timesheet: timesheet as unknown as AttendanceInfoType | null,
// 		timeline: timeline as unknown as AttendanceInfoType[],
// 		statistics: statistics as unknown as AttendanceInfoType[],
// 	};
// };

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
