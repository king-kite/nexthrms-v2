import { PermissionModelChoices } from '@prisma/client';

import { getPrismaModels, models, permissions } from '../../../../../config';
import { getObjectPermissions, prisma } from '../../../../../db';
import { admin } from '../../../../../middlewares';
import { hasModelPermission } from '../../../../../utils';
import { NextApiErrorMessage } from '../../../../../utils/classes';
import { objectPermissionSchema } from '../../../../../validators';

export default admin()
	.use(async (req, res, next) => {
		// Check the user has edit or view permissions
		const editPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [
				permissions.permissionobject.EDIT,
			]);

		const viewPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [
				permissions.permissionobject.VIEW,
			]);

		if (!editPerm && !viewPerm) throw new NextApiErrorMessage(403);

		const modelName = (
			req.query.model as string as PermissionModelChoices
		)?.toLowerCase() as PermissionModelChoices;
		const objectId = (req.query.objectId as string)?.toLowerCase() as string;

		// Check if modelName is in the valid models array
		if (!models.includes(modelName))
			return res.status(404).json({
				status: 'error',
				message: 'Permissions for this record table do not exist!',
			});

		// Check if there is a prisma model for it
		const prismaModel = getPrismaModels(modelName);
		if (!prismaModel)
			return res.status(404).json({
				status: 'error',
				message: 'Record table name does not exist!',
			});

		// check if the object exists
		const obj = await (prisma[prismaModel] as any).findUnique({
			where: {
				id: objectId,
			},
			select: {
				id: true,
			},
		});

		if (!obj) {
			return res.status(404).json({
				status: 'error',
				message: 'Record with this ID does not exist!',
			});
		}

		next();
	})
	.get(async (req, res) => {
		const hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [
				permissions.permissionobject.VIEW,
			]);

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const modelName = (
			req.query.model as string as PermissionModelChoices
		)?.toLowerCase() as PermissionModelChoices;
		const objectId = (req.query.objectId as string)?.toLowerCase() as string;
		const permission = req.query.permission as
			| ('DELETE' | 'EDIT' | 'VIEW')
			| undefined;
		const {
			groupLimit,
			groupOffset,
			groupSearch,
			userLimit,
			userOffset,
			userSearch,
		} = req.query;

		// Check to see if the groups and users are been paginated or search
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
	// middleware for post, put, delete
	.use(async (req, res, next) => {
		const permission = req.query.permission;

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

		next();
	})
	// Sets the users and groups permissions
	.post(async (req, res) => {
		const hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [
				permissions.permissionobject.EDIT,
			]);

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const modelName = (
			req.query.model as string as PermissionModelChoices
		)?.toLowerCase() as PermissionModelChoices;
		const objectId = (req.query.objectId as string)?.toLowerCase() as string;
		const permission = (req.query.permission as string)?.toUpperCase() as
			| 'DELETE'
			| 'EDIT'
			| 'VIEW';

		const data: {
			groups?: string[];
			users?: string[];
		} = await objectPermissionSchema.validateAsync(
			{ ...req.body },
			{ abortEarly: false }
		);

		await prisma.permissionObject.upsert({
			create: {
				permission,
				modelName,
				objectId,
				users: data.users
					? {
							connect: data.users.map((id) => ({ id })),
					  }
					: undefined,
				groups: data.groups
					? {
							connect: data.groups.map((id) => ({ id })),
					  }
					: undefined,
			},
			where: {
				modelName_objectId_permission: {
					modelName,
					objectId,
					permission,
				},
			},
			update: {
				users: data.users
					? {
							set: data.users.map((id) => ({ id })),
					  }
					: undefined,
				groups: data.groups
					? {
							set: data.groups.map((id) => ({ id })),
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
			message: 'Set ' + im + ' permissions successfully!',
		});
	})
	// Update/Connects the users and groups permissions
	.put(async (req, res) => {
		const hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [
				permissions.permissionobject.EDIT,
			]);

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const modelName = (
			req.query.model as string as PermissionModelChoices
		)?.toLowerCase() as PermissionModelChoices;
		const objectId = (req.query.objectId as string)?.toLowerCase() as string;
		const permission = (req.query.permission as string)?.toUpperCase() as
			| 'DELETE'
			| 'EDIT'
			| 'VIEW';

		const data: {
			groups?: string[];
			users?: string[];
		} = await objectPermissionSchema.validateAsync(
			{ ...req.body },
			{ abortEarly: false }
		);

		await prisma.permissionObject.upsert({
			create: {
				permission,
				modelName,
				objectId,
				users: data.users
					? {
							connect: data.users.map((id) => ({ id })),
					  }
					: undefined,
				groups: data.groups
					? {
							connect: data.groups.map((id) => ({ id })),
					  }
					: undefined,
			},
			where: {
				modelName_objectId_permission: {
					modelName,
					objectId,
					permission,
				},
			},
			update: {
				users: data.users
					? {
							connect: data.users.map((id) => ({ id })),
					  }
					: undefined,
				groups: data.groups
					? {
							connect: data.groups.map((id) => ({ id })),
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
			message: 'Updated ' + im + ' successfully!',
		});
	})
	// Dissconnects the users and groups permissions
	.delete(async (req, res) => {
		const hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [
				permissions.permissionobject.EDIT,
			]);

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const modelName = (
			req.query.model as string as PermissionModelChoices
		)?.toLowerCase() as PermissionModelChoices;
		const objectId = (req.query.objectId as string)?.toLowerCase() as string;
		const permission = (req.query.permission as string)?.toUpperCase() as
			| 'DELETE'
			| 'EDIT'
			| 'VIEW';

		const data: {
			groups?: string[];
			users?: string[];
		} = await objectPermissionSchema.validateAsync(
			{ ...req.body },
			{ abortEarly: false }
		);

		await prisma.permissionObject.upsert({
			create: {
				permission,
				modelName,
				objectId,
			},
			where: {
				modelName_objectId_permission: {
					modelName,
					objectId,
					permission,
				},
			},
			update: {
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
