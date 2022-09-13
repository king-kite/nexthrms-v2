import type { NextApiRequest } from 'next';

import { DEFAULT_PAGINATION_SIZE } from '../config/settings';

export function validateParams(query: NextApiRequest['query']): {
	limit?: number;
	offset?: number;
	search?: string;
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

	return { limit, offset, search };
}
