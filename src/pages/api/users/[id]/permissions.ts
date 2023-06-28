import { permissions } from '../../../../config';
import prisma from '../../../../db';
import { getPermissions } from '../../../../db/queries/permissions';
import { getUserPermissions } from '../../../../db/queries/users';
import { getUserObjectPermissions, getUserObjects } from '../../../../db/utils';
import { admin } from '../../../../middlewares';
import { hasModelPermission } from '../../../../utils/permission';
import { NextApiErrorMessage } from '../../../../utils/classes';
import { validateParams } from '../../../../validators';
import { updateUserPermissionsSchema } from '../../../../validators/users';

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
		const data = await getUserPermissions(req.query.id as string, params);

		return res.status(200).json({
			status: 'success',
			message:
				"Fetched user's permissions successfully. A total of " + data.total,
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

		const data = await updateUserPermissionsSchema.validate(
			{ ...req.body },
			{ abortEarly: false }
		);

		// Do this check to make sure a user can not set a permission that he can't even view

		// Check if the user is not a superuser and has the write to even view
		// the permissions he is about to set for another user
		let canSetPerm = false;
		if (req.user.isSuperUser) canSetPerm = true;
		else {
			// Can view all permissions i.e. model level
			const hasViewPerm = hasModelPermission(req.user.allPermissions, [
				permissions.permission.VIEW,
			]);
			if (hasViewPerm) canSetPerm = true;
			else {
				// If the user has any view object level permissions
				const userObjects = await getUserObjects({
					modelName: 'permissions',
					permission: 'VIEW',
					userId: req.user.id,
				});

				if (userObjects.length > 0) {
					const { result } = await getPermissions({
						where: {
							id: {
								in: userObjects.map((obj) => obj.objectId),
							},
						},
					});

					// Loop through the permissions sent by the request user and make sure
					// the request user has access to view them all
					const hasAllPermissions = data.permissions.every((codename) => {
						const found = result.find((perm) => perm.codename === codename);
						if (found) return true;
						else return false;
					});
					if (hasAllPermissions) canSetPerm = true;
				}
			}
		}

		if (!canSetPerm)
			throw new NextApiErrorMessage(
				403,
				'You are not authorized to set some of the requested permissions!'
			);

		await prisma.user.update({
			where: {
				id: req.query.id as string,
			},
			data: {
				permissions: {
					set: data.permissions.map((codename) => ({
						codename,
					})),
				},
			},
			select: {
				id: true,
			},
		});

		return res.status(200).json({
			status: 'success',
			message: "User's permissions were updated successfully!",
		});
	});
