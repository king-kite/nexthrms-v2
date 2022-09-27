import { Overtime, Prisma } from '@prisma/client';

import prisma from '../client';
import { DEFAULT_PAGINATION_SIZE } from '../../config/settings';
import { OvertimeType } from '../../types';

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
	offset = 0,
	limit = DEFAULT_PAGINATION_SIZE,
	id,
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
			where: { employeeId: params.id, status: 'APPROVED' },
		}),
		prisma.overtime.count({
			where: { employeeId: params.id, status: 'PENDING' },
		}),
		prisma.overtime.count({
			where: { employeeId: params.id, status: 'DENIED' },
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
	offset = 0,
	limit = DEFAULT_PAGINATION_SIZE,
	search,
}: ParamsType): Prisma.OvertimeFindManyArgs => {
	const query: Prisma.OvertimeFindManyArgs = {
		skip: offset,
		take: limit,
		orderBy: {
			createdAt: 'desc',
		},
		where: search
			? {
					OR: [
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
					],
			  }
			: {},
		select: overtimeSelectQuery,
	};

	return query;
};

export const getAllOvertimeAdmin = async (
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
	result: Overtime[] | OvertimeType[];
}> => {
	const query = getAllOvertimeAdminQuery({ ...params });

	const [total, result, approved, pending, denied] = await prisma.$transaction([
		prisma.overtime.count({ where: query.where }),
		prisma.overtime.findMany(query),
		prisma.overtime.count({ where: { status: 'APPROVED' } }),
		prisma.overtime.count({ where: { status: 'PENDING' } }),
		prisma.overtime.count({ where: { status: 'DENIED' } }),
	]);

	return { total, approved, pending, denied, result };
};

// ****** Admin Overtime Stop ******
