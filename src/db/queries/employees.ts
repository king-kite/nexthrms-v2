import { Employee, Prisma } from '@prisma/client';

import prisma from '../client';
import { DEFAULT_PAGINATION_SIZE } from '../../config/settings';
import { EmployeeType } from '../../types';

type ParamsType = {
	offset?: number;
	limit?: number;
	search?: string;
};

export const employeeSelectQuery: Prisma.EmployeeSelect = {
	id: true,
	dateEmployed: true,
	department: {
		select: {
			id: true,
			name: true,
			hod: {
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
									dob: true,
									gender: true,
									address: true,
									city: true,
									phone: true,
									state: true,
								},
							},
						},
					},
				},
			},
		},
	},
	job: {
		select: {
			id: true,
			name: true,
		},
	},
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
			isActive: true,
		},
	},
	supervisor: {
		select: {
			id: true,
			department: {
				select: {
					name: true,
				},
			},
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
	leaves: {
		where: {
			status: 'APPROVED',
			startDate: {
				lte: new Date(),
			},
			endDate: {
				gte: new Date(),
			},
		},
		select: {
			status: true,
			reason: true,
			startDate: true,
			endDate: true,
			type: true,
		},
	},
};

export const getEmployeesQuery = ({
	offset = 0,
	limit = DEFAULT_PAGINATION_SIZE,
	search = undefined,
}: ParamsType): Prisma.EmployeeFindManyArgs => {
	const query: Prisma.EmployeeFindManyArgs = {
		take: limit,
		skip: offset,
		select: employeeSelectQuery,
		orderBy: {
			user: {
				firstName: 'asc' as const,
			},
		},
		where: search
			? {
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
			  }
			: {},
	};

	return query;
};

export const getEmployees = async (
	params: ParamsType = {
		offset: 0,
		limit: DEFAULT_PAGINATION_SIZE,
		search: undefined,
	}
): Promise<{
	active: number;
	inactive: number;
	total: number;
	on_leave: number;
	result: EmployeeType[] | Employee[];
}> => {
	const query = getEmployeesQuery({ ...params });

	const [total, result, active, inactive, on_leave] = await prisma.$transaction(
		[
			prisma.employee.count({ where: query.where }),
			prisma.employee.findMany(query),
			prisma.employee.count({
				where: {
					user: {
						isActive: true,
					},
				},
			}),
			prisma.employee.count({
				where: {
					user: {
						isActive: false,
					},
				},
			}),
			prisma.employee.aggregate({
				where: {
					leaves: {
						every: {
							status: 'APPROVED',
							startDate: {
								lte: new Date(),
							},
							endDate: {
								gte: new Date(),
							},
						},
					},
				},
				_count: true,
			}),
		]
	);

	return { total, active, inactive, result, on_leave: on_leave._count };
};

export const getEmployee = async (id: string) => {
	const employee = await prisma.employee.findUnique({
		where: { id },
		select: employeeSelectQuery,
	});

	return employee;
};
