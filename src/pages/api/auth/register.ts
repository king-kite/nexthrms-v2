import axios from 'axios';

import { REGISTER_URL } from '../../../config/services';
import handler from '../../../middlewares';
import { registerSchema } from '../../../validators/auth';

export default handler().post(async function (req, res) {
	const data = await registerSchema.validate(
		{ ...req.body },
		{
			abortEarly: false,
			stripUnknown: true,
		}
	);

	const response = await axios.post(REGISTER_URL, data);
	return res.status(201).json(response.data);
});
