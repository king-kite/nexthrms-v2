import axios from 'axios';

import { ASSET_URL } from '../../../config/services';
import handler from '../../../middlewares';
import { createAssetSchema } from '../../../validators/assets';

export default handler()
	.get(async function (req, res) {
		const response = await axios.get(ASSET_URL((req.query.id as string).toString()));
		return res.status(200).json(response.data);
	})
	.put(async (req, res) => {
		const data = await createAssetSchema.validate(
			{ ...req.body },
			{
				abortEarly: false,
				stripUnknown: true,
			}
		);

		const response = await axios.put(ASSET_URL((req.query.id as string).toString()), data);
		return res.status(200).json(response.data);
	})
	.delete(async function (req, res) {
		const response = await axios.delete(ASSET_URL((req.query.id as string).toString()));
		return res.status(200).json(response.data);
	});
