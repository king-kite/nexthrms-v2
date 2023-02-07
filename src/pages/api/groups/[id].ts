import type { NextApiRequest } from 'next';

import { getGroup, groupSelectQuery, prisma } from '../../../db';
import { auth } from '../../../middlewares';
import { CreateGroupQueryType, ParamsType } from '../../../types';
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
		let params:
			| {
					user?: ParamsType;
			  }
			| undefined = {};
		const userParams = validateParams(getGroupUserParamsQuery(req.query));

		const isEmpty = Object.values(userParams).every(
			(item) => item === undefined
		);

		if (isEmpty) {
			params = undefined;
		} else {
			params.user = userParams;
		}

		const data = await getGroup(req.query.id as string, params);

		if (!data)
			return res.status(404).json({
				status: 'success',
				message: 'Group with specified ID does not exist!',
			});

		return res.status(200).json({
			status: 'success',
			message: 'Fetched group successfully',
			data,
		});
	})
	.put(async (req, res) => {
		const data: CreateGroupQueryType = await createGroupSchema.validateAsync(
			{ ...req.body },
			{ abortEarly: false }
		);

		const group = await prisma.group.update({
			where: {
				id: req.query.id as string,
			},
			data: {
				name: data.name,
				description: data.description,
				active: data.active,
				permissions: data.permissions
					? {
							set: data.permissions.map((codename) => ({ codename })),
					  }
					: undefined,
				users: data.users
					? {
							set: data.users.map((id) => ({ id })),
					  }
					: undefined,
			},
			select: groupSelectQuery,
		});

		return res.status(200).json({
			status: 'success',
			message: 'Group updated successfully!',
			data: group,
		});
	})
	.delete(async (req, res) => {
		await prisma.group.delete({
			where: {
				id: req.query.id as string,
			},
		});
		return res.status(200).json({
			status: 'success',
			message: 'Group deleted successfully!',
		});
	});
