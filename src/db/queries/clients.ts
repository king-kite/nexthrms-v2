import { Prisma } from '@prisma/client';

import prisma from '../client';
import { ClientType, ParamsType } from '../../types';

export const clientSelectQuery = {
	id: true,
	company: true,
	// Note: Contact is the user model/table relation name
	contact: {
		select: {
			id: true,
			firstName: true,
			lastName: true,
			email: true,
			profile: {
				select: {
					image: {
						select: {
							url: true,
						},
					},
					gender: true,
					city: true,
					address: true,
					dob: true,
					phone: true,
					state: true,
				},
			},
			isActive: true,
		},
	},
	position: true,
	updatedAt: true,
	createdAt: true,
};

export const getClientsQuery = ({
	offset,
	limit,
	search = undefined,
	from,
	to,
	where = {},
}: ParamsType & {
	where?: Prisma.ClientWhereInput;
}): Prisma.ClientFindManyArgs => {
	const query: Prisma.ClientFindManyArgs = {
		skip: offset,
		take: limit,
		orderBy: {
			company: 'asc' as const,
		},
		where: search
			? {
					OR: [
						{
							company: {
								contains: search,
								mode: 'insensitive',
							},
						},
						{
							contact: {
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
					...where,
			  }
			: where,
		select: clientSelectQuery,
	};

	if (from && to && query.where) {
		query.where.createdAt = {
			gte: from,
			lte: to,
		};
	}

	return query;
};

export const getClients = async (
	params?: ParamsType & {
		where?: Prisma.ClientWhereInput;
	}
): Promise<{
	active: number;
	inactive: number;
	total: number;
	result: ClientType[];
}> => {
	const query = getClientsQuery({ ...params });

	const [total, active, inactive, result] = await prisma.$transaction([
		prisma.client.count({ where: query.where }),
		prisma.client.count({
			where: {
				contact: {
					isActive: true,
				},
				...query.where,
			},
		}),
		prisma.client.count({
			where: {
				contact: {
					isActive: false,
				},
				...query.where,
			},
		}),
		prisma.client.findMany(query),
	]);

	return { total, active, inactive, result: result as unknown as ClientType[] };
};

export const getClient = async (id: string) => {
	const client = await prisma.client.findUnique({
		where: { id },
		select: clientSelectQuery,
	});

	return client;
};
