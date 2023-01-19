import { Prisma } from '@prisma/client';

import prisma from '../client';
import { JobType, ParamsType } from '../../types';

export const getJobsQuery = ({
	offset,
	limit,
	search = undefined,
	from,
	to
}: ParamsType): Prisma.JobFindManyArgs => {
	const query: Prisma.JobFindManyArgs = {
		skip: offset,
		take: limit,
		select: {
			id: true,
			name: true,
		},
		orderBy: {
			name: 'asc' as const,
		},
		where: search
			? {
					name: {
						contains: search,
						mode: 'insensitive',
					},
			  }
			: {},
	};

	if (from && to && query.where) {
		query.where.createdAt = {
			gte: from,
			lte: to,
		};
	}

	return query;
};

export const getJobs = async (
	params: {
		offset?: number;
		limit?: number;
		search?: string;
	} = {
		search: undefined,
	}
): Promise<{ total: number; result: JobType[] }> => {
	const query = getJobsQuery({ ...params });
	const [total, result] = await prisma.$transaction([
		prisma.job.count({ where: query.where }),
		prisma.job.findMany(query),
	]);

	return { total, result };
};
