import { permissions } from '../../../../config';
import { getUserGroups, prisma } from '../../../../db';
import { getUserObjectPermissions } from '../../../db/utils';
import { admin } from '../../../../middlewares';
import { hasModelPermission } from '../../../../utils';
import { NextApiErrorMessage } from '../../../../utils/classes';
import { updateUserGroupsSchema, validateParams } from '../../../../validators';

export default admin()
	.get(async (req, res) => {
		let hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.user.VIEW]);

		if (!hasPerm) {
			// check if the user has a view object permission for this record
			const objPerm = await getUserObjectPermissions({
				modelName: 'users',
				objectId: req.query.id as string,
				permission: 'VIEW',
				userId: req.user.id,
			});
			if (objPerm.view === true) hasPerm = true;
		}

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const params = validateParams(req.query);
		const data = await getUserGroups(req.query.id as string, params);

		return res.status(200).json({
			status: 'success',
			message: "Fetched user's groups successfully. A total of " + data.total,
			data,
		});
	})
	.put(async (req, res) => {
		let hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.user.EDIT]);

		if (!hasPerm) {
			// check if the user has a view object permission for this record
			const objPerm = await getUserObjectPermissions({
				modelName: 'users',
				objectId: req.query.id as string,
				permission: 'EDIT',
				userId: req.user.id,
			});
			if (objPerm.edit === true) hasPerm = true;
		}

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const data: {
			groups: string[];
		} = await updateUserGroupsSchema.validateAsync({ ...req.body });

		await prisma.user.update({
			where: {
				id: req.query.id as string,
			},
			data: {
				groups: {
					set: data.groups.map((id) => ({ id })),
				},
			},
			select: {
				id: true,
			},
		});

		return res.status(200).json({
			status: 'success',
			message: "User's groups were updated successfully!",
		});
	});
