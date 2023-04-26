import type { NextApiRequest } from 'next';

import { permissions } from '../../../config';
import { getGroup, groupSelectQuery, prisma } from '../../../db';
import { getRecord, getUserObjectPermissions } from '../../../db/utils';
import { admin } from '../../../middlewares';
import { CreateGroupQueryType, GroupType, ParamsType } from '../../../types';
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
		const record = await getRecord<GroupType | null>({
			model: 'groups',
			perm: 'group',
			objectId: req.query.id as string,
			permission: 'VIEW',
			user: req.user,
			getData() {
				let params:
					| {
							user?: ParamsType;
					  }
					| undefined = {};
				const userParams = validateParams(getGroupUserParamsQuery(req.query));

				const isEmpty = Object.values(userParams).every(
					(item) => item === undefined
				);
				if (isEmpty) params = undefined;
				else params.user = userParams;
				return getGroup(req.query.id as string, params);
			},
		});

		if (!record) throw new NextApiErrorMessage(403);

		if (!record.data)
			return res.status(404).json({
				status: 'success',
				message: 'Group with specified ID does not exist!',
			});

		return res.status(200).json({
			status: 'success',
			message: 'Fetched group successfully',
			data: record.data,
		});
	})
	.put(async (req, res) => {
		let hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.group.EDIT]);

		if (!hasPerm) {
			// check if the user has a view object permission for this record
			const objPerm = await getUserObjectPermissions({
				modelName: 'groups',
				objectId: req.query.id as string,
				permission: 'EDIT',
				userId: req.user.id,
			});
			if (objPerm.edit === true) hasPerm = true;
		}

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const data: CreateGroupQueryType = await createGroupSchema.validateAsync(
			{ ...req.body },
			{ abortEarly: false }
		);

		const group = await prisma.group.update({
			where: {
				id: req.query.id as string,
			},
			data: {
				name: data.name.toLowerCase(),
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
		let hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.group.DELETE]);

		if (!hasPerm) {
			// check if the user has a view object permission for this record
			const objPerm = await getUserObjectPermissions({
				modelName: 'groups',
				objectId: req.query.id as string,
				permission: 'DELETE',
				userId: req.user.id,
			});
			if (objPerm.delete === true) hasPerm = true;
		}

		if (!hasPerm) throw new NextApiErrorMessage(403);

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
