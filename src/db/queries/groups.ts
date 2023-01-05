import { Prisma, Group } from '@prisma/client';

import prisma from '../client';
import { DEFAULT_PAGINATION_SIZE } from '../../config/settings';
import {
	ParamsType,
	GroupType,
} from '../../types';

export const groupSelectQuery: Prisma.GroupSelect = {
	id: true,
	name: true
};

export const getGroupsQuery = ({
	offset = 0,
	limit = DEFAULT_PAGINATION_SIZE,
	search = undefined,
	all = false,
}: ParamsType): Prisma.GroupFindManyArgs => {
	const query: Prisma.GroupFindManyArgs = {
		select: groupSelectQuery,
		orderBy: {
            name: 'asc' as const			
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
			  }
			: {},
	};

	if (all === false) {
		if (offset !== undefined) query.skip = offset;
		if (limit !== undefined) query.take = limit;
	}

	return query;
};

export const getGroup = async (id: string) => {
	const group = await prisma.group.findUnique({
		where: { id },
		select: groupSelectQuery,
	});

	return group;
};

export const getGroups = async (
	params: ParamsType
): Promise<{
	total: number;
	result: GroupType[] | Group[];
}> => {
	const query = getGroupsQuery({ ...params });

	const [total, result] = await prisma.$transaction([
		prisma.group.count({ where: query.where }),
		prisma.group.findMany(query),
	]);

	return {
		total,
		result,
	};
};
