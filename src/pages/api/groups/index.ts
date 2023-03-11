import type { NextApiRequest } from 'next';

import { permissions } from '../../../config';
import {
	getGroups,
	groupSelectQuery,
	prisma,
	GetGroupsParamsType,
} from '../../../db';
import { addObjectPermissions, getRecords } from '../../../db/utils';
import { admin } from '../../../middlewares';
import { CreateGroupQueryType, GroupType } from '../../../types';
import { hasModelPermission } from '../../../utils';
import { NextApiErrorMessage } from '../../../utils/classes';
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

export default admin()
	.get(async (req, res) => {
		const result = await getRecords<{
			total: number;
			result: GroupType[];
		}>({
			model: 'groups',
			perm: 'group',
			query: req.query,
			user: req.user,
			placeholder: {
				total: 0,
				result: [],
			},
			getData(recordParams) {
				const params: GetGroupsParamsType = recordParams;
				const usersParams = validateParams(getGroupUserParamsQuery(req.query));

				const isEmpty = Object.values(usersParams).every(
					(item) => item === undefined
				);

				if (!isEmpty) {
					params.users = usersParams;
				}

				return getGroups(params);
			},
		});

		if (result) return res.status(200).json(result);

		throw new NextApiErrorMessage(403);
	})
	.post(async (req, res) => {
		const hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.group.CREATE]);

		if (!hasPerm) throw new NextApiErrorMessage(403);

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

		if (group.id)
			await addObjectPermissions({
				model: 'groups',
				objectId: group.id,
				userId: req.user.id,
			});

		return res.status(201).json({
			status: 'success',
			message: 'Group added successfully',
			data: group,
		});
	});
