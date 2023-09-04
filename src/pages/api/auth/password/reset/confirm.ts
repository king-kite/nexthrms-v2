import axios from 'axios';

import { PASSWORD_RESET_CONFIRM_URL } from '../../../../../config/services';
import handler from '../../../../../middlewares';
import { passwordResetSchema } from '../../../../../validators/auth';

export default handler().post(async function (req, res) {
	const data = await passwordResetSchema.validate(
		{ ...req.body },
		{
			abortEarly: false,
			stripUnknown: true,
		}
	);

	const response = await axios.post(PASSWORD_RESET_CONFIRM_URL, data);
	return res.status(200).json(response.data);
});
