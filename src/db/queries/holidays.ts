import { Prisma } from '@prisma/client';

import prisma from '../client';
import { DEFAULT_PAGINATION_SIZE } from '../../config/settings';
import { HolidayType } from '../../types';

type ParamsType = {
	offset?: number;
	limit?: number;
	search?: string;
};

export const holidaySelectQuery: Prisma.HolidaySelect = {
	id: true,
	name: true,
	date: true,
};

export const getHolidaysQuery = ({
	offset = 0,
	limit = DEFAULT_PAGINATION_SIZE,
	search = undefined,
}: ParamsType): Prisma.HolidayFindManyArgs => {
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
			  }
			: {},
	};

	return query;
};

export const getHolidays = async (
	params: {
		offset?: number;
		limit?: number;
		search?: string;
	} = {
		offset: 0,
		limit: DEFAULT_PAGINATION_SIZE,
		search: undefined,
	}
): Promise<{ total: number; result: HolidayType[] }> => {
	const query = getHolidaysQuery({ ...params });
	const [total, result] = await prisma.$transaction([
		prisma.holiday.count({ where: query.where }),
		prisma.holiday.findMany(query),
	]);

	return { total, result };
};
