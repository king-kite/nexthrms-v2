import { Prisma } from '@prisma/client';

import prisma from '../client';
import { LeaveType, ParamsType } from '../../types';

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
	offset,
	limit,
	id,
	from,
	to,
	where = {},
}: ParamsType & {
	id: string;
	where?: Prisma.LeaveWhereInput;
}): Prisma.LeaveFindManyArgs => {
	const query: Prisma.LeaveFindManyArgs = {
		skip: offset,
		take: limit,
		orderBy: {
			createdAt: 'desc',
		},
		where: {
			employee: { id },
			...where,
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
				},
				{
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
		where?: Prisma.LeaveWhereInput;
	}
): Promise<{
	approved: number;
	pending: number;
	denied: number;
	total: number;
	result: LeaveType[];
}> => {
	const query = getLeavesQuery({ ...params });
	const currentDate = new Date();
	currentDate.setHours(0, 0, 0, 0);

	const [total, result, approved, pending, denied] = await prisma.$transaction([
		prisma.leave.count({ where: query.where }),
		prisma.leave.findMany(query),
		prisma.leave.count({
			where: { ...query.where, employeeId: params.id, status: 'APPROVED' },
		}),
		prisma.leave.count({
			where: {
				...query.where,
				employeeId: params.id,
				status: 'PENDING',
				// If the startDate is greater or equal to the current date
				// then it's still pending else it's expired.
				startDate: {
					gte: currentDate,
				},
			},
		}),
		prisma.leave.count({
			where: { ...query.where, employeeId: params.id, status: 'DENIED' },
		}),
	]);

	return {
		total,
		approved,
		pending,
		denied,
		result: result as unknown as LeaveType[],
	};
};

export const getLeave = async (id: string) => {
	const leave = await prisma.leave.findUnique({
		where: { id },
		select: leaveSelectQuery,
	});
	return leave as unknown as LeaveType | null;
};

// ****** Personal Leaves Stop ******

// ****** Admin Leaves Start ******

// TODO: ADD PERMISSIONS
export const getLeavesAdminQuery = ({
	offset,
	limit,
	search = '',
	from,
	to,
	where = {},
}: ParamsType & {
	where?: Prisma.LeaveWhereInput;
}): Prisma.LeaveFindManyArgs => {
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
											},
											{
												endDate: {
													gte: from,
													lte: to,
												},
											},
										],
								  }
								: undefined,
						...where,
				  }
				: where,
		select: leaveSelectQuery,
	};

	return query;
};

export const getLeavesAdmin = async (
	params: ParamsType & {
		where?: Prisma.LeaveWhereInput;
	} = {
		search: '',
	}
): Promise<{
	approved: number;
	pending: number;
	denied: number;
	total: number;
	result: LeaveType[];
}> => {
	const query = getLeavesAdminQuery({ ...params });

	const currentDate = new Date();
	currentDate.setHours(0, 0, 0, 0);

	const [total, result, approved, pending, denied] = await prisma.$transaction([
		prisma.leave.count({ where: query.where }),
		prisma.leave.findMany(query),
		prisma.leave.count({ where: { ...query.where, status: 'APPROVED' } }),
		prisma.leave.count({
			where: {
				...query.where,
				status: 'PENDING',
				// If the startDate is greater or equal to the current date
				// then it's still pending else it's expired.
				startDate: {
					gte: currentDate,
				},
			},
		}),
		prisma.leave.count({ where: { ...query.where, status: 'DENIED' } }),
	]);

	return {
		total,
		approved,
		pending,
		denied,
		result: result as unknown as LeaveType[],
	};
};

// ****** Admin Leaves Stop ******
