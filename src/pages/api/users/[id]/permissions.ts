import { permissions } from '../../../../config';
import { getPermissions, getUserPermissions, prisma } from '../../../../db';
import {
	getRecords,
	getUserObjectPermissions,
	getUserObjects,
} from '../../../../db/utils';
import { admin } from '../../../../middlewares';
import { PermissionType } from '../../../../types';
import { hasModelPermission } from '../../../../utils';
import { NextApiErrorMessage } from '../../../../utils/classes';
import {
	updateUserPermissionsSchema,
	validateParams,
} from '../../../../validators';

export default admin()
	.get(async (req, res) => {
		const records = await getRecords<{
			total: number;
			result: PermissionType[];
		}>({
			model: 'users',
			perm: 'user',
			query: req.query,
			placeholder: {
				total: 0,
				result: [],
			},
			user: req.user,
			getData() {
				const params = validateParams(req.query);
				return getUserPermissions(req.query.id as string, params);
			},
		});

		if (!records) throw new NextApiErrorMessage(403);

		return res.status(200).json(records);
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
			permissions: string[];
		} = await updateUserPermissionsSchema.validateAsync({ ...req.body });

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
