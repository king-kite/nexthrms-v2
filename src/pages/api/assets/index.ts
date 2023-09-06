import { ASSETS_URL } from '../../../config/services';
import { auth } from '../../../middlewares';
import { axiosJn } from '../../../utils/axios';
import { createAssetSchema } from '../../../validators/assets';
import { getRouteParams } from '../../../validators/pagination';

export default auth()
	.get(async function (req, res) {
		const params = getRouteParams(req.query);

		const response = await axiosJn(req).get(ASSETS_URL + params);
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

		const response = await axiosJn(req).post(ASSETS_URL, data);
		return res.status(201).json(response.data);
	});
