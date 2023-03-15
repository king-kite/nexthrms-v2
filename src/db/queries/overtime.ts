import { Prisma } from '@prisma/client';

import prisma from '../client';
import { OvertimeType, ParamsType } from '../../types';

const employeeSelectQuery: Prisma.EmployeeSelect = {
	id: true,
	user: {
		select: {
			id: true,
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
	department: {
		select: {
			name: true,
		},
	},
	job: {
		select: {
			name: true,
		},
	},
};

export const overtimeSelectQuery: Prisma.OvertimeSelect = {
	id: true,
	date: true,
	hours: true,
	reason: true,
	type: true,
	status: true,
	employee: {
		select: employeeSelectQuery,
	},
	createdBy: {
		select: employeeSelectQuery,
	},
	approvedBy: {
		select: employeeSelectQuery,
	},
	updatedAt: true,
	createdAt: true,
};

// ****** Personal Overtime Start ******

export const getAllOvertimeQuery = ({
	offset,
	limit,
	id,
	from,
	to,
	where = {},
}: ParamsType & {
	id: string;
	where?: Prisma.OvertimeWhereInput;
}): Prisma.OvertimeFindManyArgs => {
	const query: Prisma.OvertimeFindManyArgs = {
		skip: offset,
		take: limit,
		orderBy: {
			createdAt: 'desc',
		},
		where: {
			employee: { id },
			...where,
		},
		select: overtimeSelectQuery,
	};

	if (from && to) {
		query.where = {
			...query.where,
			date: {
				gte: from,
				lte: to,
			},
		};
	}

	return query;
};

export const getAllOvertime = async (
	params: ParamsType & {
		id: string;
		where?: Prisma.OvertimeWhereInput;
	}
): Promise<{
	approved: number;
	pending: number;
	denied: number;
	total: number;
	result: OvertimeType[];
}> => {
	const query = getAllOvertimeQuery(params);

	const currentDate = new Date();
	currentDate.setHours(0, 0, 0, 0);

	const [total, result, approved, pending, denied] = await prisma.$transaction([
		prisma.overtime.count({ where: query.where }),
		prisma.overtime.findMany(query),
		prisma.overtime.count({
			where: { ...query.where, employeeId: params.id, status: 'APPROVED' },
		}),
		prisma.overtime.count({
			where: {
				...query.where,
				employeeId: params.id,
				status: 'PENDING',
				date: {
					gte: currentDate,
				},
			},
		}),
		prisma.overtime.count({
			where: { ...query.where, employeeId: params.id, status: 'DENIED' },
		}),
	]);

	return {
		total,
		approved,
		pending,
		denied,
		result: result as unknown as OvertimeType[],
	};
};

export const getOvertime = async (id: string) => {
	const overtime = await prisma.overtime.findUnique({
		where: { id },
		select: overtimeSelectQuery,
	});
	return overtime as unknown as OvertimeType | null;
};

// ****** Personal Overtime Stop ******

// ****** Admin Overtime Start ******

// TODO: ADD PERMISSIONS
export const getAllOvertimeAdminQuery = ({
	offset,
	limit,
	search = '',
	from,
	to,
	where = {},
}: ParamsType & {
	where?: Prisma.OvertimeWhereInput;
}): Prisma.OvertimeFindManyArgs => {
	const query: Prisma.OvertimeFindManyArgs = {
		skip: offset,
		take: limit,
		orderBy: {
			createdAt: 'desc',
		},
		where:
			search || (from && to)
				? {
						OR: search
							? [
									{
										employee: {
											user: {
												firstName: {
													contains: search,
													mode: 'insensitive',
												},
											},
										},
									},
									{
										employee: {
											user: {
												lastName: {
													contains: search,
													mode: 'insensitive',
												},
											},
										},
									},
									{
										employee: {
											user: {
												email: {
													contains: search,
													mode: 'insensitive',
												},
											},
										},
									},
							  ]
							: undefined,
						AND:
							from && to
								? {
										date: {
											gte: from,
											lte: to,
										},
								  }
								: undefined,
						...where,
				  }
				: where,
		select: overtimeSelectQuery,
	};

	return query;
};

export const getAllOvertimeAdmin = async (
	params: ParamsType & {
		where?: Prisma.OvertimeWhereInput;
	} = {
		search: '',
	}
): Promise<{
	approved: number;
	pending: number;
	denied: number;
	total: number;
	result: OvertimeType[];
}> => {
	const query = getAllOvertimeAdminQuery({ ...params });

	const currentDate = new Date();
	currentDate.setHours(0, 0, 0, 0);

	const [total, result, approved, pending, denied] = await prisma.$transaction([
		prisma.overtime.count({ where: query.where }),
		prisma.overtime.findMany(query),
		prisma.overtime.count({ where: { ...query.where, status: 'APPROVED' } }),
		prisma.overtime.count({
			where: {
				...query.where,
				status: 'PENDING',
				date: {
					gte: currentDate,
				},
			},
		}),
		prisma.overtime.count({ where: { ...query.where, status: 'DENIED' } }),
	]);

	return {
		total,
		approved,
		pending,
		denied,
		result: result as unknown as OvertimeType[],
	};
};

// ****** Admin Overtime Stop ******
