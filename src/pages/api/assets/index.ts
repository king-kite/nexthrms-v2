import { permissions } from '../../../config';
import prisma from '../../../db';
import {
	assetSelectQuery as selectQuery,
	getAssets,
} from '../../../db/queries/assets';
import { addObjectPermissions, getRecords } from '../../../db/utils';
import { admin } from '../../../middlewares';
import { AssetType } from '../../../types';
import { hasModelPermission } from '../../../utils/permission';
import { NextErrorMessage } from '../../../utils/classes';
import { createAssetSchema } from '../../../validators/assets';

export default admin()
	.get(async (req, res) => {
		const result = await getRecords<{
			total: number;
			result: AssetType[];
		}>({
			model: 'assets',
			perm: 'asset',
			query: req.query,
			user: req.user,
			placeholder: {
				total: 0,
				result: [],
			},
			getData(params) {
				return getAssets(params);
			},
		});

		if (result) return res.status(200).json(result);

		throw new NextErrorMessage(403);
	})
	.post(async (req, res) => {
		const hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.asset.CREATE]);

		if (!hasPerm) throw new NextErrorMessage(403);

		const valid = await createAssetSchema.validate(
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
				users: [req.user.id],
			});

		return res.status(201).json({
			status: 'success',
			message: 'Asset was added successfully',
			data,
		});
	});
