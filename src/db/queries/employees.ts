import { Employee, Prisma } from '@prisma/client';

import prisma from '../client';
import { EmployeeType, ParamsType } from '../../types';

const date = new Date();
date.setHours(0, 0, 0, 0);

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
					dob: true,
					gender: true,
					address: true,
					city: true,
					phone: true,
					state: true,
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
			status: {
				equals: 'APPROVED',
			},
			startDate: {
				lte: date,
			},
			endDate: {
				gte: date,
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
	offset,
	limit,
	search = undefined,
	from,
	to
}: ParamsType): Prisma.EmployeeFindManyArgs => {
	const query: Prisma.EmployeeFindManyArgs = {
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

	if (offset !== undefined) query.skip = offset;
	if (limit !== undefined) query.take = limit;

	if (from && to && query.where) {
		query.where.createdAt = {
			gte: from,
			lte: to,
		};
	}

	return query;
};

export const getEmployees = async (params?: ParamsType): Promise<{
	active: number;
	inactive: number;
	total: number;
	on_leave: number;
	result: EmployeeType[] | Employee[];
}> => {
	const query = getEmployeesQuery({...params});

	const [total, result, active, on_leave] = await prisma.$transaction([
		prisma.employee.count({ where: query.where }),
		prisma.employee.findMany(query),
		prisma.employee.count({
			where: {
				AND: [
					{
						user: {
							isActive: true,
						},
					},
					{
						leaves: {
							none: {
								status: {
									equals: 'APPROVED',
								},
								startDate: {
									lte: date,
								},
								endDate: {
									gte: date,
								},
							},
						},
					},
				],
			},
		}),
		// prisma.employee.count({
		// 	where: {
		// 		user: {
		// 			isActive: false,
		// 		},
		// 	},
		// }),
		prisma.employee.count({
			where: {
				leaves: {
					some: {
						status: {
							equals: 'APPROVED',
						},
						startDate: {
							lte: date,
						},
						endDate: {
							gte: date,
						},
					},
				},
			},
		}),
	]);

	return { total, active, inactive: total - active, on_leave, result };
};

export const getEmployee = async (id: string) => {
	const employee = await prisma.employee.findUnique({
		where: { id },
		select: employeeSelectQuery,
	});

	return employee;
};
