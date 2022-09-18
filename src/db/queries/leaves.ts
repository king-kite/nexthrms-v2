import { Leave, Prisma } from '@prisma/client';

import prisma from '../client';
import { DEFAULT_PAGINATION_SIZE } from '../../config/settings';
import { LeaveType } from '../../types';

type ParamsType = {
	offset?: number;
	limit?: number;
	search?: string;
};

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
};

export const getLeavesQuery = ({
	offset = 0,
	limit = DEFAULT_PAGINATION_SIZE,
	id,
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
		prisma.leave.count({ where: { status: 'APPROVED' } }),
		prisma.leave.count({ where: { status: 'PENDING' } }),
		prisma.leave.count({ where: { status: 'DENIED' } }),
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
