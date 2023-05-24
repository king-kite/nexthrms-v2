import { Prisma } from '@prisma/client';

import prisma from '../client';
import { HolidayType, ParamsType } from '../../types';

export const holidaySelectQuery: Prisma.HolidaySelect = {
	id: true,
	name: true,
	date: true,
	createdAt: true,
	updatedAt: true,
};

export const getHolidaysQuery = ({
	offset,
	limit,
	search = undefined,
	from,
	to,
	where = {},
}: ParamsType & {
	where?: Prisma.HolidayWhereInput;
}): Prisma.HolidayFindManyArgs => {
	const query: Prisma.HolidayFindManyArgs = {
		skip: offset,
		take: limit,
		select: holidaySelectQuery,
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

export const getHolidays = async (
	params: ParamsType & {
		where?: Prisma.HolidayWhereInput;
	} = {
		search: undefined,
	}
): Promise<{ total: number; result: HolidayType[] }> => {
	const query = getHolidaysQuery({ ...params });
	const [total, result] = await prisma.$transaction([
		prisma.holiday.count({ where: query.where }),
		prisma.holiday.findMany(query),
	]);

	return { total, result: result as unknown as HolidayType[] };
};

export async function getHoliday(id: string) {
	const result = await prisma.holiday.findUnique({
		where: { id },
		select: holidaySelectQuery,
	});

	return result as unknown as HolidayType | null;
}
