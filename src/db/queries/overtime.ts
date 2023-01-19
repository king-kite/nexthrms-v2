import { Overtime, Prisma } from '@prisma/client';

import prisma from '../client';
import { OvertimeType, ParamsType } from '../../types';

const employeeSelectQuery: Prisma.EmployeeSelect = {
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
}: ParamsType & {
	id: string;
}): Prisma.OvertimeFindManyArgs => {
	const query: Prisma.OvertimeFindManyArgs = {
		skip: offset,
		take: limit,
		orderBy: {
			createdAt: 'desc',
		},
		where: {
			employee: { id },
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
	}
): Promise<{
	approved: number;
	pending: number;
	denied: number;
	total: number;
	result: Overtime[] | OvertimeType[];
}> => {
	const query = getAllOvertimeQuery({ ...params });

	const [total, result, approved, pending, denied] = await prisma.$transaction([
		prisma.overtime.count({ where: query.where }),
		prisma.overtime.findMany(query),
		prisma.overtime.count({
			where: { ...query.where, employeeId: params.id, status: 'APPROVED' },
		}),
		prisma.overtime.count({
			where: { ...query.where, employeeId: params.id, status: 'PENDING' },
		}),
		prisma.overtime.count({
			where: { ...query.where, employeeId: params.id, status: 'DENIED' },
		}),
	]);

	return { total, approved, pending, denied, result };
};

export const getOvertime = async (id: string) => {
	const overtime = await prisma.overtime.findUnique({
		where: { id },
		select: overtimeSelectQuery,
	});
	return overtime;
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
}: ParamsType): Prisma.OvertimeFindManyArgs => {
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
				  }
				: {},
		select: overtimeSelectQuery,
	};

	return query;
};

export const getAllOvertimeAdmin = async (
	params: ParamsType = {
		search: '',
	}
): Promise<{
	approved: number;
	pending: number;
	denied: number;
	total: number;
	result: Overtime[] | OvertimeType[];
}> => {
	const query = getAllOvertimeAdminQuery({ ...params });

	const [total, result, approved, pending, denied] = await prisma.$transaction([
		prisma.overtime.count({ where: query.where }),
		prisma.overtime.findMany(query),
		prisma.overtime.count({ where: { ...query.where, status: 'APPROVED' } }),
		prisma.overtime.count({ where: { ...query.where, status: 'PENDING' } }),
		prisma.overtime.count({ where: { ...query.where, status: 'DENIED' } }),
	]);

	return { total, approved, pending, denied, result };
};

// ****** Admin Overtime Stop ******
