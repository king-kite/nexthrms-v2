import {
	assetSelectQuery as selectQuery,
	getAssets,
	prisma,
} from '../../../db';
import { auth } from '../../../middlewares';
import { AssetCreateQueryType } from '../../../types';
import { createAssetSchema, validateParams } from '../../../validators';

export default auth()
	.get(async (req, res) => {
		const params = validateParams(req.query);

		const data = await getAssets({ ...params });

		return res.status(200).json({
			status: 'success',
			message: 'Fetched assets successfully! A total of ' + data.total,
			data,
		});
	})
	.post(async (req, res) => {
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

		return res.status(201).json({
			status: 'success',
			message: 'Asset was added successfully',
			data,
		});
	});
