import { Prisma, Group } from '@prisma/client';

import prisma from '../client';
import {
	ParamsType,
	GroupType,
} from '../../types';

export const groupSelectQuery: Prisma.GroupSelect = {
	id: true,
	name: true,
};

export const getGroupsQuery = ({
	offset,
	limit,
	search = undefined,
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

	if (offset) query.skip = offset;
	if (limit) query.take = limit;

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
	params: ParamsType = { search: undefined }
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
