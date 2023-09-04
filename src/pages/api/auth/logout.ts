import axios from 'axios';

import { LOGOUT_URL } from '../../../config/services';
import handler from '../../../middlewares';

export default handler().post(async function (req, res) {
	const response = await axios.post(LOGOUT_URL);
	return res.status(200).json(response.data);
});
