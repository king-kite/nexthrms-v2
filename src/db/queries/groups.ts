import { Prisma } from '@prisma/client';

import { permissionSelectQuery } from './permissions';
import prisma from '../client';
import { ParamsType, GroupType } from '../../types';

// Default Group User Select Query
export const groupUserSelectQuery: Prisma.UserSelect = {
	id: true,
	firstName: true,
	lastName: true,
	email: true,
	isActive: true,
	profile: {
		select: {
			image: true,
		},
	},
};

// Default Group Select Query
export const groupSelectQuery: Prisma.GroupSelect = {
	id: true,
	name: true,
	description: true,
	active: true,
	permissions: {
		select: permissionSelectQuery,
	},
	users: {
		select: groupUserSelectQuery,
	},
};

// Get Groups from params. Note: This does not require 'group user' query modification
export const getGroupsQuery = ({
	offset,
	limit,
	search = undefined,
	where = {},
	select = {},
}: ParamsType & {
	where?: Prisma.GroupWhereInput;
	select?: Prisma.GroupSelect;
}): Prisma.GroupFindManyArgs => {
	const query: Prisma.GroupFindManyArgs = {
		select: {
			...groupSelectQuery,
			...select,
		},
		orderBy: {
			name: 'asc' as const,
		},
		where: search
			? {
					OR: [
						{
							name: {
								contains: search,
								mode: 'insensitive',
							},
						},
					],
					...where,
			  }
			: where,
	};

	if (offset) query.skip = offset;
	if (limit) query.take = limit;

	return query;
};

// Modify/Paginate the user select query from the global group select query
// And also count the users in the group
export const getGroupUserSelectQuery = (
	defaultQuery: Prisma.GroupSelect,
	params?: ParamsType
): Prisma.GroupSelect => {
	const query: Prisma.GroupSelect = defaultQuery;
	if (params && query.users && typeof query.users !== 'boolean') {
		if (params.limit) {
			query.users.take = params.limit;
			query.users.skip = params.offset || 0;
		}
		if (params.search) {
			query.users.where = {
				OR: [
					{
						firstName: {
							contains: params.search,
							mode: 'insensitive',
						},
					},
					{
						lastName: {
							contains: params.search,
							mode: 'insensitive',
						},
					},
					{
						email: {
							contains: params.search,
							mode: 'insensitive',
						},
					},
				],
			};
		}
		if (params.from) {
			query.users.where = {
				...query.users.where,
				createdAt: {
					gte: params.from,
					lte: params.to || new Date(),
				},
			};
		}
	}

	// Count the users
	// Do note that this count does not return the total number of users
	// according to the where query. It gets all the total number of all users
	// irrespective of the where query.
	query._count = {
		select: {
			users: true,
		},
	};

	return query;
};

// Get the group and also pass in pagination params for the user select query
export const getGroup = async (
	id: string,
	params?: {
		user?: ParamsType;
	}
) => {
	const query: Prisma.GroupSelect = getGroupUserSelectQuery(
		groupSelectQuery,
		params?.user
	);

	const group = await prisma.group.findUnique({
		where: { id },
		select: query,
	});

	return group as unknown as GroupType | null;
};

export type GetGroupsParamsType = ParamsType & {
	users?: ParamsType;
};

export const getGroups = async (
	params: GetGroupsParamsType & {
		where?: Prisma.GroupWhereInput;
		select?: Prisma.GroupSelect;
	} = { search: undefined }
): Promise<{
	total: number;
	result: GroupType[];
}> => {
	const { users, ...groupParams } = params;
	let query = getGroupsQuery({ ...groupParams });

	// Modify the query to cater for the user select query
	if (users && query.select) {
		query.select = getGroupUserSelectQuery(query.select, users);
	}

	const [total, result] = await prisma.$transaction([
		prisma.group.count({ where: query.where }),
		prisma.group.findMany(query),
	]);

	return {
		total,
		result: result as unknown as GroupType[],
	};
};
