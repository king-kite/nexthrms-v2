import { Leave, Prisma } from '@prisma/client';

import prisma from '../client';
import { DEFAULT_PAGINATION_SIZE } from '../../config/settings';
import { LeaveType, ParamsType } from '../../types';

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

export const leaveSelectQuery: Prisma.LeaveSelect = {
	id: true,
	startDate: true,
	endDate: true,
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

// ****** Personal Leaves Start ******

export const getLeavesQuery = ({
	offset = 0,
	limit = DEFAULT_PAGINATION_SIZE,
	id,
	from,
	to,
}: ParamsType & {
	id: string;
}): Prisma.LeaveFindManyArgs => {
	const query: Prisma.LeaveFindManyArgs = {
		skip: offset,
		take: limit,
		orderBy: {
			createdAt: 'desc',
		},
		where: {
			employee: { id },
		},
		select: leaveSelectQuery,
	};

	if (from && to) {
		query.where = {
			...query.where,
			OR: [
				{
					startDate: {
						gte: from,
						lte: to,
					},
					endDate: {
						gte: from,
						lte: to,
					},
				},
			],
		};
	}

	return query;
};

export const getLeaves = async (
	params: ParamsType & {
		id: string;
	}
): Promise<{
	approved: number;
	pending: number;
	denied: number;
	total: number;
	result: Leave[] | LeaveType[];
}> => {
	const query = getLeavesQuery({ ...params });

	const [total, result, approved, pending, denied] = await prisma.$transaction([
		prisma.leave.count({ where: query.where }),
		prisma.leave.findMany(query),
		prisma.leave.count({
			where: { ...query.where, employeeId: params.id, status: 'APPROVED' },
		}),
		prisma.leave.count({
			where: { ...query.where, employeeId: params.id, status: 'PENDING' },
		}),
		prisma.leave.count({
			where: { ...query.where, employeeId: params.id, status: 'DENIED' },
		}),
	]);

	return { total, approved, pending, denied, result };
};

export const getLeave = async (id: string) => {
	const leave = await prisma.leave.findUnique({
		where: { id },
		select: leaveSelectQuery,
	});
	return leave;
};

// ****** Personal Leaves Stop ******

// ****** Admin Leaves Start ******

// TODO: ADD PERMISSIONS
export const getLeavesAdminQuery = ({
	offset = 0,
	limit = DEFAULT_PAGINATION_SIZE,
	search = '',
	from,
	to,
}: ParamsType): Prisma.LeaveFindManyArgs => {
	const query: Prisma.LeaveFindManyArgs = {
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
										OR: [
											{
												startDate: {
													gte: from,
													lte: to,
												},
												endDate: {
													gte: from,
													lte: to,
												},
											},
										],
								  }
								: undefined,
				  }
				: {},
		select: leaveSelectQuery,
	};

	return query;
};

export const getLeavesAdmin = async (
	params: ParamsType = {
		limit: DEFAULT_PAGINATION_SIZE,
		offset: 0,
		search: '',
	}
): Promise<{
	approved: number;
	pending: number;
	denied: number;
	total: number;
	result: Leave[] | LeaveType[];
}> => {
	const query = getLeavesAdminQuery({ ...params });

	const [total, result, approved, pending, denied] = await prisma.$transaction([
		prisma.leave.count({ where: query.where }),
		prisma.leave.findMany(query),
		prisma.leave.count({ where: { ...query.where, status: 'APPROVED' } }),
		prisma.leave.count({ where: { ...query.where, status: 'PENDING' } }),
		prisma.leave.count({ where: { ...query.where, status: 'DENIED' } }),
	]);

	return { total, approved, pending, denied, result };
};

// ****** Admin Leaves Stop ******
