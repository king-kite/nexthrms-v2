import { Prisma } from '@prisma/client';

import prisma from '..';
import { ManagedFileType, ParamsType } from '../../types';

export const managedFileSelectQuery: Prisma.ManagedFileSelect = {
	id: true,
	name: true,
	url: true,
	size: true,
	storageInfo: true,
	type: true,
	user: {
		select: {
			id: true,
			firstName: true,
			lastName: true,
			email: true,
			profile: {
				select: {
					image: {
						select: {
							id: true,
							url: true,
						},
					},
				},
			},
		},
	},
	profile: {
		select: {
			id: true,
		},
	},
	projectFile: {
		select: {
			id: true,
		},
	},
	updatedAt: true,
	createdAt: true,
};

export const getManagedFilesQuery = ({
	offset,
	limit,
	search,
	from,
	to,
	where = {},
}: ParamsType & {
	where?: Prisma.ManagedFileWhereInput;
}): Prisma.ManagedFileFindManyArgs => {
	const query: Prisma.ManagedFileFindManyArgs = {
		skip: offset,
		take: limit,
		orderBy: {
			updatedAt: 'desc' as const,
		},
		where:
			search || (from && to)
				? {
						OR: search
							? [
									{
										name: {
											contains: search,
											mode: 'insensitive',
										},
									},
									{
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
									},
							  ]
							: undefined,
						AND:
							from && to
								? [
										{
											updatedAt: {
												gte: from,
												lte: to,
											},
										},
								  ]
								: undefined,
						...where,
				  }
				: where,
		select: managedFileSelectQuery,
	};

	return query;
};

export const getManagedFiles = async (
	params?: ParamsType & {
		where?: Prisma.ManagedFileWhereInput;
	}
): Promise<{
	total: number;
	result: ManagedFileType[];
}> => {
	const query = getManagedFilesQuery({ ...params });

	const [total, result] = await prisma.$transaction([
		prisma.managedFile.count({ where: query.where }),
		prisma.managedFile.findMany(query),
	]);

	return { total, result: result as unknown as ManagedFileType[] };
};

export const getManagedFile = async (id: string) => {
	const file = await prisma.managedFile.findUnique({
		where: { id },
		select: managedFileSelectQuery,
	});

	return file as unknown as ManagedFileType | null;
};
