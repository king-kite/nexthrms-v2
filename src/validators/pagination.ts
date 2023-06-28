import type { NextApiRequest } from 'next';

// import { DEFAULT_PAGINATION_SIZE } from '../config/settings';
import { ParamsType } from '../types';

export function validateParams(
	query: NextApiRequest['query'] | ParamsType
): ParamsType {
	const limit =
		query.limit && !isNaN(Number(query.limit))
			? Number(query.limit)
			: // : DEFAULT_PAGINATION_SIZE;
			  undefined;
	const offset =
		query.offset && !isNaN(Number(query.offset)) ? Number(query.offset) : 0;
	const search =
		typeof query.search === 'string' && query.search.trim() !== ''
			? query.search
			: // : '';
			  undefined;
	const from =
		query.from && (typeof query.from === 'string' || query.from instanceof Date)
			? new Date(query.from)
			: undefined;
	const to =
		query.to && (typeof query.to === 'string' || query.to instanceof Date)
			? new Date(query.to)
			: // : new Date();
			  undefined;
	const date =
		query.date && (typeof query.date === 'string' || query.date instanceof Date)
			? new Date(query.date)
			: undefined;
	return { limit, offset, search, from, to, date };
}
