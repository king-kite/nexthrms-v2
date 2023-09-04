import axios from 'axios';

import { LOGIN_URL } from '../../../config/services';
import handler from '../../../middlewares';
import { loginSchema } from '../../../validators/auth';

export default handler().post(async function (req, res) {
	const data = await loginSchema.validate(
		{ ...req.body },
		{
			abortEarly: false,
			stripUnknown: true,
		}
	);

	const response = await axios.post(LOGIN_URL, data);
	return res.status(200).json(response.data);
});
