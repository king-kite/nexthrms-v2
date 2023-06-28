import { Prisma } from '@prisma/client';

import prisma from '..';
import { JobType, ParamsType } from '../../types';

export const jobSelectQuery: Prisma.JobSelect = {
	id: true,
	name: true,
	updatedAt: true,
	createdAt: true,
};

export const getJobsQuery = ({
	offset,
	limit,
	search = undefined,
	from,
	to,
	where = {},
}: ParamsType & {
	where?: Prisma.JobWhereInput;
}): Prisma.JobFindManyArgs => {
	const query: Prisma.JobFindManyArgs = {
		skip: offset,
		take: limit,
		select: jobSelectQuery,
		orderBy: {
			name: 'asc' as const,
		},
		where: search
			? {
					name: {
						contains: search,
						mode: 'insensitive',
					},
					...where,
			  }
			: where,
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
	params: ParamsType & {
		where?: Prisma.JobWhereInput;
	} = {
		search: undefined,
	}
): Promise<{ total: number; result: JobType[] }> => {
	const query = getJobsQuery({ ...params });
	const [total, result] = await prisma.$transaction([
		prisma.job.count({ where: query.where }),
		prisma.job.findMany(query),
	]);

	return { total, result: result as unknown as JobType[] };
};

export async function getJob(id: string) {
	const result = await prisma.job.findUnique({
		where: { id },
		select: jobSelectQuery,
	});

	return result as unknown as JobType | null;
}
