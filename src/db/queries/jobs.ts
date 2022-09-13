import { Prisma } from '@prisma/client';

import prisma from '../client';
import { DEFAULT_PAGINATION_SIZE } from '../../config/settings';
import { JobType } from '../../types';

type ParamsType = {
	offset?: number;
	limit?: number;
	search?: string;
};

export const getJobsQuery = ({
	offset = 0,
	limit = DEFAULT_PAGINATION_SIZE,
	search = undefined,
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

	return query;
};

export const getJobs = async (
	params: {
		offset?: number;
		limit?: number;
		search?: string;
	} = {
		offset: 0,
		limit: DEFAULT_PAGINATION_SIZE,
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
