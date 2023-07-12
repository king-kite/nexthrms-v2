import type { NextApiRequest } from 'next';

import { ParamsType } from '../types';
import { getOffsetDate } from '../utils/dates';

export function validateParams(
	query: NextApiRequest['query'] | ParamsType
): ParamsType {
	const limit =
		query.limit && !isNaN(Number(query.limit))
			? Number(query.limit)
			: undefined;
	const offset =
		query.offset && !isNaN(Number(query.offset)) ? Number(query.offset) : 0;
	const search =
		typeof query.search === 'string' && query.search.trim() !== ''
			? query.search
			: undefined;
	const from =
		query.from && (typeof query.from === 'string' || query.from instanceof Date)
			? (getOffsetDate(query.from) as Date)
			: undefined;
	const to =
		query.to && (typeof query.to === 'string' || query.to instanceof Date)
			? (getOffsetDate(query.to) as Date)
			: undefined;
	const date =
		query.date && (typeof query.date === 'string' || query.date instanceof Date)
			? (getOffsetDate(query.date) as Date)
			: undefined;
	return { limit, offset, search, from, to, date };
}
