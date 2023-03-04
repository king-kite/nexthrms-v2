import { permissions } from '../../../config';
import {
	assetSelectQuery as selectQuery,
	getAssets,
	prisma,
} from '../../../db';
import { addObjectPermissions, getUserObjects } from '../../../db/utils';
import { admin } from '../../../middlewares';
import { AssetCreateQueryType } from '../../../types';
import { hasModelPermission } from '../../../utils';
import { NextApiErrorMessage } from '../../../utils/classes';
import { createAssetSchema, validateParams } from '../../../validators';

export default admin()
	.get(async (req, res) => {
		const hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.asset.VIEW]);

		// if the user has model permissions
		if (hasPerm) {
			const params = validateParams(req.query);
			const data = await getAssets({ ...params });

			return res.status(200).json({
				status: 'success',
				message: 'Fetched assets successfully! A total of ' + data.total,
				data,
			});
		}

		// if the user has any view object level permissions
		const userObjects = await getUserObjects({
			modelName: 'assets',
			permission: 'VIEW',
			userId: req.user.id,
		});

		if (userObjects.length > 0) {
			const params = validateParams(req.query);
			const data = await getAssets({
				...params,
				where: {
					id: {
						in: userObjects.map((obj) => obj.objectId),
					},
				},
			});
			if (data.total > 0) {
				return res.status(200).json({
					status: 'success',
					message: 'Fetched assets successfully! A total of ' + data.total,
					data,
				});
			}
		}

		throw new NextApiErrorMessage(403);
	})
	.post(async (req, res) => {
		const hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.asset.CREATE]);

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const valid: AssetCreateQueryType = await createAssetSchema.validateAsync(
			{ ...req.body },
			{
				abortEarly: false,
			}
		);

		const data = await prisma.asset.create({
			data: valid,
			select: selectQuery,
		});

		if (data && data.id)
			// Set the object permissions
			await addObjectPermissions({
				model: 'assets',
				objectId: data.id,
				userId: req.user.id,
			});

		return res.status(201).json({
			status: 'success',
			message: 'Asset was added successfully',
			data,
		});
	});
