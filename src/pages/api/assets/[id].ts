import { permissions } from '../../../config';
import { assetSelectQuery as selectQuery, prisma, getAsset } from '../../../db';
import { getUserObjectPermissions } from '../../../db/utils';
import { admin } from '../../../middlewares';
import { AssetCreateQueryType } from '../../../types';
import { hasModelPermission } from '../../../utils';
import { NextApiErrorMessage } from '../../../utils/classes';
import { createAssetSchema } from '../../../validators';

export default admin()
	.get(async (req, res) => {
		let hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.asset.VIEW]);

		if (!hasPerm) {
			// check if the user has a view object permission for this record
			const objPerm = await getUserObjectPermissions({
				modelName: 'assets',
				objectId: req.query.id as string,
				permission: 'VIEW',
				userId: req.user.id,
			});
			if (objPerm.view === true) hasPerm = true;
		}

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const data = await getAsset(req.query.id as string);

		if (!data)
			return res.status(404).json({
				status: 'success',
				message: 'Asset with specified ID does not exist!',
			});

		return res.status(200).json({
			status: 'success',
			message: 'Fetched asset successfully',
			data,
		});
	})
	.put(async (req, res) => {
		let hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.asset.EDIT]);

		if (!hasPerm) {
			// check if the user has a view object permission for this record
			const objPerm = await getUserObjectPermissions({
				modelName: 'assets',
				objectId: req.query.id as string,
				permission: 'EDIT',
				userId: req.user.id,
			});
			if (objPerm.edit === true) hasPerm = true;
		}

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const valid: AssetCreateQueryType = await createAssetSchema.validateAsync(
			{ ...req.body },
			{ abortEarly: false }
		);

		const data = await prisma.asset.update({
			where: {
				id: req.query.id as string,
			},
			data: valid,
			select: selectQuery,
		});

		return res.status(200).json({
			status: 'success',
			message: 'Asset information was updated successfully!',
			data,
		});
	})
	.delete(async (req, res) => {
		let hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.asset.VIEW]);

		if (!hasPerm) {
			// check if the user has a view object permission for this record
			const objPerm = await getUserObjectPermissions({
				modelName: 'assets',
				objectId: req.query.id as string,
				permission: 'DELETE',
				userId: req.user.id,
			});
			if (objPerm.delete === true) hasPerm = true;
		}

		if (!hasPerm) throw new NextApiErrorMessage(403);

		await prisma.asset.delete({
			where: {
				id: req.query.id as string,
			},
		});
		return res.status(200).json({
			status: 'success',
			message: 'Asset was removed deleted successfully!',
		});
	});
