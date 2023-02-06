import type { NextApiRequest } from 'next';

import {
	getGroups,
	groupSelectQuery,
	prisma,
	GetGroupsParamsType,
} from '../../../db';
import { auth } from '../../../middlewares';
import { CreateGroupQueryType } from '../../../types';
import { createGroupSchema, validateParams } from '../../../validators';

function getGroupUserParamsQuery(query: NextApiRequest['query']) {
	const userQuery: NextApiRequest['query'] = {};
	if (query.userLimit) userQuery.limit = query.userLimit;
	if (query.userOffset) userQuery.offset = query.userOffset;
	if (query.userSearch) userQuery.search = query.userSearch;
	if (query.userFrom) userQuery.from = query.userFrom;
	if (query.userTo) userQuery.to = query.userTo;
	return userQuery;
}

export default auth()
	.get(async (req, res) => {
		const params: GetGroupsParamsType = validateParams(req.query);
		const usersParams = validateParams(getGroupUserParamsQuery(req.query));

		const isEmpty = Object.values(usersParams).every(
			(item) => item === undefined
		);

		if (!isEmpty) {
			params.users = usersParams;
		}

		const data = await getGroups(params);

		return res.status(200).json({
			status: 'success',
			message: 'Fetched groups successfully! A total of ' + data.total,
			data,
		});
	})
	.post(async (req, res) => {
		const data: CreateGroupQueryType = await createGroupSchema.validateAsync(
			{ ...req.body },
			{
				abortEarly: false,
			}
		);

		const group = await prisma.group.create({
			data: {
				name: data.name,
				description: data.description,
				active: data.active,
				permissions: data.permissions
					? {
							connect: data.permissions.map((codename) => ({ codename })),
					  }
					: undefined,
				users: data.users
					? {
							connect: data.users.map((id) => ({ id })),
					  }
					: undefined,
			},
			select: groupSelectQuery,
		});

		return res.status(201).json({
			status: 'success',
			message: 'Group added successfully',
			data: group,
		});
	});
