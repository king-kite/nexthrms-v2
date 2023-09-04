import axios from 'axios';

import { USER_DATA_URL } from '../../../config/services';
import handler from '../../../middlewares';

export default handler().get(async function (req, res) {
	const response = await axios.get(USER_DATA_URL);
	return res.status(200).json(response.data);
});
