import { Prisma } from '@prisma/client';

import prisma from '../client';
import { AssetType, ParamsType } from '../../types';

export const assetSelectQuery: Prisma.AssetSelect = {
	id: true,
	assetId: true,
	condition: true,
	description: true,
	model: true,
	manufacturer: true,
	name: true,
	purchaseDate: true,
	purchaseFrom: true,
	serialNo: true,
	status: true,
	supplier: true,
	warranty: true,
	value: true,
	updatedAt: true,
	createdAt: true,
	user: {
		select: {
			id: true,
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
};

export const getAssetsQuery = ({
	offset,
	limit,
	search,
	from,
	to,
	where = {},
}: ParamsType & {
	where?: Prisma.AssetWhereInput;
}): Prisma.AssetFindManyArgs => {
	const query: Prisma.AssetFindManyArgs = {
		skip: offset,
		take: limit,
		orderBy: {
			updatedAt: 'desc' as const,
		},
		where:
			search || (from && to)
				? {
						OR: [
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
						],
						AND:
							from && to
								? [
										{
											purchaseDate: {
												gte: from,
												lte: to,
											},
										},
								  ]
								: undefined,
						...where,
				  }
				: where,
		select: assetSelectQuery,
	};

	return query;
};

export const getAssets = async (
	params?: ParamsType & {
		where?: Prisma.AssetWhereInput;
	}
): Promise<{
	total: number;
	result: AssetType[];
}> => {
	const query = getAssetsQuery({ ...params });

	const [total, result] = await prisma.$transaction([
		prisma.asset.count({ where: query.where }),
		prisma.asset.findMany(query),
	]);

	return { total, result: result as unknown as AssetType[] };
};

export const getAsset = async (id: string) => {
	const asset = await prisma.asset.findUnique({
		where: { id },
		select: assetSelectQuery,
	});

	return asset as unknown as AssetType | null;
};
