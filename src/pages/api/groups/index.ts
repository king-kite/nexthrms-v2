import type { NextApiRequest } from 'next';

import { GROUPS_URL } from '../../../config/services';
import { auth } from '../../../middlewares';
import { axiosJn } from '../../../utils/axios';
import { getRouteParams } from '../../../validators/pagination';
import { createGroupSchema } from '../../../validators/users';

function getGroupUserParamsQuery(query: NextApiRequest['query']) {
	const userQuery: NextApiRequest['query'] = {};
	if (query.userLimit) userQuery.limit = query.userLimit;
	if (query.userOffset) userQuery.offset = query.userOffset;
	if (query.userSearch) userQuery.search = query.userSearch;
	if (query.userFrom) userQuery.from = query.userFrom;
	if (query.userTo) userQuery.to = query.userTo;
	return userQuery;
}

export function getGroupUserRouteParams(query: NextApiRequest['query']) {
	const {
		userLimit: limit,
		userOFfset: offset,
		userSearch: search,
		userFrom: from,
		userTo: to,
		userDate: date,
	} = getGroupUserParamsQuery(query);
	const params = `userLimit=${limit || ''}&userOffset=${offset || ''}&userFrom=${
		from || ''
	}&userTo=${to || ''}&userSearch=${search || ''}&userDate=${date || ''}`;

	return params;
}

export default auth()
	.get(async function (req, res) {
		const params = getRouteParams(req.query);
		const groupUserParams = getGroupUserRouteParams(req.query);

		const response = await axiosJn(req).get(GROUPS_URL + params + '&' + groupUserParams);
		return res.status(200).json(response.data);
	})
	.post(async function (req, res) {
		const data = await createGroupSchema.validate(
			{ ...req.body },
			{
				abortEarly: false,
				stripUnknown: true,
			}
		);

		const response = await axiosJn(req).post(GROUPS_URL, data);
		return res.status(201).json(response.data);
	});
