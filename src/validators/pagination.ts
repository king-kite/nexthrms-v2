import type { NextApiRequest } from 'next';

import { ParamsType } from '../types';
import { getDate } from '../utils/dates';

export function getRouteParams(query: NextApiRequest['query'] | ParamsType) {
	const { limit, offset, search, from, to, date } = validateParams(query);

	const params = `?limit=${limit || ''}&offset=${offset || ''}&from=${from || ''}&to=${
		to || ''
	}&search=${search || ''}&date=${date || ''}`;

	return params;
}

export function validateParams(query: NextApiRequest['query'] | ParamsType): ParamsType {
	const limit = query.limit && !isNaN(Number(query.limit)) ? Number(query.limit) : undefined;
	const offset = query.offset && !isNaN(Number(query.offset)) ? Number(query.offset) : 0;
	const search =
		typeof query.search === 'string' && query.search.trim() !== '' ? query.search : undefined;
	const from =
		query.from && (typeof query.from === 'string' || query.from instanceof Date)
			? (getDate(query.from) as Date).toISOString()
			: undefined;
	const to =
		query.to && (typeof query.to === 'string' || query.to instanceof Date)
			? (getDate(query.to) as Date).toISOString()
			: undefined;
	const date =
		query.date && (typeof query.date === 'string' || query.date instanceof Date)
			? (getDate(query.date) as Date).toISOString()
			: undefined;
	return { limit, offset, search, from, to, date };
}
