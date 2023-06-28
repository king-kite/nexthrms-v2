import { permissions } from '../../../../config';
import prisma from '../../../../db';
import { getGroups } from '../../../../db/queries/groups';
import { getUserGroups } from '../../../../db/queries/users';
import {
	getUserObjectPermissions,
	getUserObjects,
} from '../../../../db/utils/permission';
import { admin } from '../../../../middlewares';
import { hasModelPermission } from '../../../../utils/permission';
import { NextApiErrorMessage } from '../../../../utils/classes';
import { validateParams } from '../../../../validators';
import { updateUserGroupsSchema } from '../../../../validators/users';

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

		const data = await updateUserGroupsSchema.validate(
			{ ...req.body },
			{ abortEarly: false }
		);

		// Do this check to make sure a user can not set a group that he can't even view

		// Check if the user is not a superuser and has the write to even view
		// the groups he is about to set for another user
		let canSetGroup = false;
		if (req.user.isSuperUser) canSetGroup = true;
		else {
			// Can view all groups i.e. model level
			const hasViewPerm = hasModelPermission(req.user.allPermissions, [
				permissions.group.VIEW,
			]);
			if (hasViewPerm) canSetGroup = true;
			else {
				// If the user has any view object level groups
				const userObjects = await getUserObjects({
					modelName: 'groups',
					permission: 'VIEW',
					userId: req.user.id,
				});

				if (userObjects.length > 0) {
					const { result } = await getGroups({
						where: {
							id: {
								in: userObjects.map((obj) => obj.objectId),
							},
						},
					});

					// Loop through the groups sent by the request user and make sure
					// the request user has access to view them all
					const hasAllGroups = data.groups.every((id) => {
						const found = result.find((group) => group.id === id);
						if (found) return true;
						else return false;
					});
					if (hasAllGroups) canSetGroup = true;
				}
			}
		}

		if (!canSetGroup)
			throw new NextApiErrorMessage(
				403,
				'You are not authorized to set some of the requested groups!'
			);

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
