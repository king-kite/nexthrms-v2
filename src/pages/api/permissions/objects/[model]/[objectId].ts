import { models, permissions } from '../../../../../config';
import { getObjectPermissions, prisma } from '../../../../../db';
import { admin } from '../../../../../middlewares';
import { PermissionModelNameType } from '../../../../../types';
import { hasPermission } from '../../../../../utils';
import { NextApiErrorMessage } from '../../../../../utils/classes';
import { objectPermissionSchema } from '../../../../../validators';

export default admin()
	.get(async (req, res) => {
		const hasPerm =
			req.user.isSuperUser ||
			hasPermission(req.user.allPermissions, [
				permissions.permissionobject.VIEW,
			]);

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const modelName = req.query.model as PermissionModelNameType;
		if (!models.includes(modelName))
			return res.status(404).json({
				status: 'error',
				message: 'Permissions for this record do not exist!',
			});

		const objectId = req.query.objectId as string;
		const permission = req.query.permission as
			| ('CREATE' | 'DELETE' | 'EDIT' | 'VIEW')
			| undefined;

		const {
			groupLimit,
			groupOffset,
			groupSearch,
			userLimit,
			userOffset,
			userSearch,
		} = req.query;

		const groupsPaginated: boolean =
			!!groupLimit || !!groupOffset || !!groupSearch;
		const usersPaginated: boolean = !!userLimit || !!userOffset || !!userSearch;

		const groups = groupsPaginated
			? {
					limit: groupLimit && !isNaN(+groupLimit) ? +groupLimit : undefined,
					offset:
						groupOffset && !isNaN(+groupOffset) ? +groupOffset : undefined,
					search: groupSearch as string,
			  }
			: undefined;

		const users = usersPaginated
			? {
					limit: userLimit && !isNaN(+userLimit) ? +userLimit : undefined,
					offset: userOffset && !isNaN(+userOffset) ? +userOffset : undefined,
					search: userSearch as string,
			  }
			: undefined;

		const options =
			groupsPaginated || usersPaginated
				? {
						groups,
						users,
				  }
				: undefined;

		const data = await getObjectPermissions(
			modelName,
			objectId,
			permission,
			options
		);

		return res.status(200).json({
			status: 'success',
			message: 'Fetched all permissions for this record successfully!',
			data,
		});
	})
	.delete(async (req, res) => {
		const hasPerm =
			req.user.isSuperUser ||
			hasPermission(req.user.allPermissions, [
				permissions.permissionobject.EDIT,
			]);

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const modelName = req.query.model as PermissionModelNameType;
		if (!models.includes(modelName))
			return res.status(404).json({
				status: 'error',
				message: 'Permissions for this record do not exist!',
			});

		const objectId = req.query.objectId as string;
		const permission = req.query.permission as
			| ('CREATE' | 'DELETE' | 'EDIT' | 'VIEW')
			| undefined;

		if (!permission) {
			return res.status(404).json({
				status: 'error',
				message: 'Permission type not found! Please provide this parameter',
			});
		}

		const { groups, users } = req.body;
		if (!groups && !users) {
			return res.status(400).json({
				status: 'error',
				message:
					'Invalid Data. Provide a groups or users field with an array of IDs',
			});
		}

		const data: {
			groups?: string[];
			users?: string[];
		} = await objectPermissionSchema.validateAsync(
			{ ...req.body },
			{ abortEarly: false }
		);

		await prisma.permissionObject.update({
			where: {
				modelName_objectId_permission: {
					modelName,
					objectId,
					permission,
				},
			},
			data: {
				users: data.users
					? {
							disconnect: data.users.map((id) => ({ id })),
					  }
					: undefined,
				groups: data.groups
					? {
							disconnect: data.groups.map((id) => ({ id })),
					  }
					: undefined,
			},
		});

		const im =
			data.groups && data.users
				? 'users and groups'
				: data.groups
				? 'groups'
				: 'users';

		return res.status(200).json({
			status: 'success',
			message: 'Removed ' + im + ' successfully!',
		});
	});
// .post(async (req, res) => {
// 	const data: { name: string } =
// 		await createPermissionCategorySchema.validateAsync(
// 			{ ...req.body },
// 			{
// 				abortEarly: false,
// 			}
// 		);

// 	const category = await prisma.permissionCategory.create({
// 		data,
// 		select: permissionCategorySelectQuery,
// 	});

// 	return res.status(201).json({
// 		status: 'success',
// 		message: 'Permission Category added successfully',
// 		data: category,
// 	});
// });
