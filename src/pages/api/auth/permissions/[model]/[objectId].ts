import {
	PermissionModelChoices,
	PermissionObjectChoices,
} from '@prisma/client';

import { getPrismaModels, models } from '../../../../../config';
import prisma from '../../../../../db/client';
import { getUserObjectPermissions } from '../../../../../db/utils';
import { auth } from '../../../../../middlewares';

export default auth()
	.use(async (req, res, next) => {
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
		const modelName = (
			req.query.model as string as PermissionModelChoices
		)?.toLowerCase() as PermissionModelChoices;
		const objectId = (req.query.objectId as string)?.toLowerCase() as string;
		const permission = req.query.permission as
			| PermissionObjectChoices
			| undefined;
		const userId = req.user.id;

		const data = await getUserObjectPermissions({
			modelName,
			objectId,
			userId,
			permission,
		});

		return res.status(200).json({
			status: 'success',
			message: "Fetched user's permissions for this record successfully!",
			data,
		});
	});
