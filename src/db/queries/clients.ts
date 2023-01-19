import { Client, Prisma } from '@prisma/client';

import prisma from '../client';
import { ClientType, ParamsType } from '../../types';

export const clientSelectQuery = {
	id: true,
	company: true,
	contact: {
		select: {
			firstName: true,
			lastName: true,
			email: true,
			profile: {
				select: {
					image: true,
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
};

export const getClientsQuery = ({
	offset,
	limit,
	search = undefined,
	from,
	to
}: ParamsType): Prisma.ClientFindManyArgs => {
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
			  }
			: {},
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

export const getClients = async (params?: ParamsType): Promise<{
	active: number;
	inactive: number;
	total: number;
	result: ClientType[] | Client[];
}> => {
	const query = getClientsQuery({...params});

	const [total, active, inactive, result] = await prisma.$transaction([
		prisma.client.count({ where: query.where }),
		prisma.client.count({
			where: {
				contact: {
					isActive: true,
				},
			},
		}),
		prisma.client.count({
			where: {
				contact: {
					isActive: false,
				},
			},
		}),
		prisma.client.findMany(query),
	]);

	return { total, active, inactive, result };
};

export const getClient = async (id: string) => {
	const client = await prisma.client.findUnique({
		where: { id },
		select: clientSelectQuery,
	});

	return client;
};
