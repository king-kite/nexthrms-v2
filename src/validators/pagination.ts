import type { NextApiRequest } from 'next';
import { isDate } from 'util/types';

import { DEFAULT_PAGINATION_SIZE } from '../config/settings';

export function validateParams(query: NextApiRequest['query']): {
	limit?: number;
	offset?: number;
	search?: string;
	startDate?: Date;
	endDate?: Date;
} {
	const limit =
		query.limit && !isNaN(Number(query.limit))
			? Number(query.limit)
			: DEFAULT_PAGINATION_SIZE;
	const offset =
		query.offset && !isNaN(Number(query.offset)) ? Number(query.offset) : 0;
	const search =
		typeof query.search === 'string' && query.search.trim() !== ''
			? query.search
			: undefined;
	const startDate =
		query.startDate &&
		(typeof query.startDate === 'string' || isDate(query.startDate))
			? new Date(query.startDate)
			: undefined;
	const endDate =
		query.endDate &&
		(typeof query.endDate === 'string' || isDate(query.endDate))
			? new Date(query.endDate)
			: undefined;

	return { limit, offset, search, startDate, endDate };
}
