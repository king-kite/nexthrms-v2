import { Prisma, User } from '@prisma/client';

import prisma from '../client';
import { UserType, ParamsType } from '../../types';

const date = new Date();
date.setHours(0, 0, 0, 0);

export const userSelectQuery: Prisma.UserSelect = {
	id: true,
	email: true,
	firstName: true,
	lastName: true,
	isActive: true,
	isAdmin: true,
	isEmailVerified: true,
	isSuperUser: true,
	createdAt: true,
	updatedAt: true,
	client: {
		select: {
			id: true,
			company: true,
			position: true,
		},
	},
	employee: {
		select: {
			id: true,
			department: {
				select: {
					id: true,
				},
			},
			job: {
				select: {
					id: true,
				},
			},
			supervisor: {
				select: {
					id: true,
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
		},
	},
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
};

export const getUsersQuery = ({
	offset,
	limit,
	search = undefined,
	from,
	to,
}: ParamsType): Prisma.UserFindManyArgs => {
	const query: Prisma.UserFindManyArgs = {
		select: userSelectQuery,
		orderBy: {
			firstName: 'asc' as const,
		},
		where: search
			? {
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

export const getUser = async (id: string) => {
	const user = await prisma.user.findUnique({
		where: { id },
		select: userSelectQuery,
	});

	return user;
};

export const getUsers = async (
	params: ParamsType = {
		search: undefined,
	}
): Promise<{
	active: number;
	inactive: number;
	on_leave: number;
	employees: number;
	clients: number;
	total: number;
	result: UserType[] | User[];
}> => {
	const query = getUsersQuery({ ...params });

	const [total, result, inactive, on_leave, employees, clients] =
		await prisma.$transaction([
			prisma.user.count({ where: query.where }),
			prisma.user.findMany(query),
			prisma.user.count({
				where: {
					OR: [
						{
							isActive: false,
						},
						{
							employee: {
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
						},
					],
				},
			}),
			prisma.user.count({
				where: {
					employee: {
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
				},
			}),
			prisma.user.count({
				where: {
					employee: {
						isNot: null,
					},
				},
			}),
			prisma.user.count({
				where: {
					client: {
						isNot: null,
					},
				},
			}),
		]);

	return {
		clients,
		employees,
		total,
		active: total - inactive,
		// active: active + clients,
		// subtract the active from the total and add clients
		// remember active also checks employees leave and clients don't take leave
		// inactive: total - (active + clients),
		inactive,
		on_leave,
		result,
	};
};
