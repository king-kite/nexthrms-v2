import { Asset, Prisma } from '@prisma/client';

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
}: ParamsType): Prisma.AssetFindManyArgs => {
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
				  }
				: {},
		select: assetSelectQuery,
	};

	return query;
};

export const getAssets = async (
	params: ParamsType
): Promise<{
	total: number;
	result: AssetType[] | Asset[];
}> => {
	const query = getAssetsQuery(params);

	const [total, result] = await prisma.$transaction([
		prisma.asset.count({ where: query.where }),
		prisma.asset.findMany(query),
	]);

	return { total, result };
};

export const getAsset = async (id: string) => {
	const asset = await prisma.asset.findUnique({
		where: { id },
		select: assetSelectQuery,
	});

	return asset;
};
