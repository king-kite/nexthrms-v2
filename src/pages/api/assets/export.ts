import axios from 'axios';

import { ASSETS_EXPORT_URL } from '../../../config/services';
import handler from '../../../middlewares';
import { getRouteParams } from '../../../validators/pagination';

export default handler().get(async function (req, res) {
	const params = getRouteParams(req.query);

	const response = await axios.get(ASSETS_EXPORT_URL + params);
	return res.status(200).json(response.data);
});
