import axios from 'axios';

import { ASSETS_URL } from '../../../config/services';
import handler from '../../../middlewares';
import { createAssetSchema } from '../../../validators/assets';
import { getRouteParams } from '../../../validators/pagination';

export default handler()
	.get(async function (req, res) {
		const params = getRouteParams(req.query);

		const response = await axios.get(ASSETS_URL + params);
		return res.status(200).json(response.data);
	})
	.post(async function (req, res) {
		const data = await createAssetSchema.validate(
			{ ...req.body },
			{
				abortEarly: false,
				stripUnknown: true,
			}
		);

		const response = await axios.post(ASSETS_URL, data);
		return res.status(201).json(response.data);
	});
