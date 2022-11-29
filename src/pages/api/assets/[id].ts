import { assetSelectQuery as selectQuery, prisma, getAsset } from '../../../db';
import { auth } from '../../../middlewares';
import { AssetCreateQueryType } from '../../../types';
import { createAssetSchema } from '../../../validators';

export default auth()
	.get(async (req, res) => {
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
