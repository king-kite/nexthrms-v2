import axios from 'axios';

import { NOTIFICATIONS_URL } from '../../../config/services';
import handler from '../../../middlewares';
import { validateParams } from '../../../validators';

export default handler().get(async function (req, res) {
	const { limit, offset, from, to } = validateParams(req.query);

	const params = `?limit=${limit}&offset=${offset}&from=${from}&to=${to}`;

	const response = await axios.get(NOTIFICATIONS_URL + params);
	return res.status(200).json(response.data.data);
});
