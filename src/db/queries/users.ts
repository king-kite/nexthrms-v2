import { Prisma } from '@prisma/client';

import { getGroupsQuery } from './groups';
import { getPermissionsQuery } from './permissions';
import prisma from '../client';
import {
	ParamsType,
	PermissionType,
	UserType,
	UserGroupType,
} from '../../types';

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
			supervisors: {
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
			image: {
				select: {
					id: true,
					url: true,
				},
			},
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
	where = {},
	select = {},
}: ParamsType & {
	where?: Prisma.UserWhereInput;
	select?: Prisma.UserSelect;
}): Prisma.UserFindManyArgs => {
	const query: Prisma.UserFindManyArgs = {
		select: {
			...userSelectQuery,
			...select,
		},
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
					...where,
			  }
			: where,
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

	return user as unknown as UserType | null;
};

export async function getUsers<DataType = UserType>(
	params: ParamsType & {
		where?: Prisma.UserWhereInput;
		select?: Prisma.UserSelect;
	} = {
		search: undefined,
	}
): Promise<{
	active: number;
	inactive: number;
	on_leave: number;
	employees: number;
	clients: number;
	total: number;
	result: DataType[];
}> {
	const query = getUsersQuery({ ...params });

	const [total, result, inactive, active, on_leave, employees, clients] =
		await prisma.$transaction([
			prisma.user.count({ where: query.where }),
			prisma.user.findMany(query),
			// old inactive query
			// prisma.user.count({
			// 	where: {
			// 		OR: [
			// 			{
			// 				isActive: false,
			// 			},
			// 			{
			// 				employee: {
			// 					leaves: {
			// 						some: {
			// 							status: {
			// 								equals: 'APPROVED',
			// 							},
			// 							startDate: {
			// 								lte: date,
			// 							},
			// 							endDate: {
			// 								gte: date,
			// 							},
			// 						},
			// 					},
			// 				},
			// 			},
			// 		],
			// 		...query.where,
			// 	},
			// }),
			prisma.user.count({
				where: {
					isActive: false,
					...query.where,
				},
			}),
			prisma.user.count({
				where: {
					isActive: true,
					OR: [
						{
							// clients
							employee: {
								is: null,
							},
						},
						{
							// is employee and is not on leave
							employee: {
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
						},
					],
					...query.where,
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
					...query.where,
				},
			}),
			prisma.user.count({
				where: {
					employee: {
						isNot: null,
					},
					...query.where,
				},
			}),
			prisma.user.count({
				where: {
					client: {
						isNot: null,
					},
					...query.where,
				},
			}),
		]);

	return {
		clients,
		employees,
		total,
		active,
		// active: total - inactive,
		// active: active + clients,
		// subtract the active from the total and add clients
		// remember active also checks employees leave and clients don't take leave
		// inactive: total - (active + clients),
		inactive,
		on_leave,
		result: result as unknown as DataType[],
	};
}

export const getUserGroups = async (
	id: string,
	params: ParamsType = {
		search: undefined,
	}
): Promise<{
	total: number;
	result: UserGroupType[];
}> => {
	const query = getGroupsQuery({ ...params });

	// Select all user's groups
	const [total, userGroups] = await prisma.$transaction([
		prisma.user.findUniqueOrThrow({
			where: { id },
			select: {
				_count: {
					select: {
						groups: true,
					},
				},
			},
		}),
		prisma.user.findUniqueOrThrow({
			where: { id },
			select: {
				groups: {
					...query,
					select: {
						id: true,
						name: true,
						description: true,
					},
				},
			},
		}),
	]);

	return {
		total: total._count.groups,
		result: userGroups.groups as UserGroupType[],
	};
};

export const getUserPermissions = async (
	id: string,
	params: ParamsType = {
		search: undefined,
	}
): Promise<{
	total: number;
	result: PermissionType[];
}> => {
	const query = getPermissionsQuery({ ...params });

	// Select all user's permission
	const [total, userPermissions] = await prisma.$transaction([
		prisma.user.findUniqueOrThrow({
			where: { id },
			select: {
				_count: {
					select: {
						permissions: true,
					},
				},
			},
		}),
		prisma.user.findUniqueOrThrow({
			where: { id },
			select: {
				permissions: query,
			},
		}),
	]);

	return {
		total: total._count.permissions,
		result: userPermissions.permissions as unknown as PermissionType[],
	};
};
