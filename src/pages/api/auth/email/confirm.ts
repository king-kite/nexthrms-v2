import axios from 'axios';

import { EMAIL_RESEND_URL } from '../../../../config/services';
import handler from '../../../../middlewares';
import { verifyUidTokenSchema } from '../../../../validators/auth';

export default handler().post(async function (req, res) {
	const data = await verifyUidTokenSchema.validate(
		{ ...req.body },
		{
			abortEarly: false,
			stripUnknown: true,
		}
	);

	const response = await axios.post(EMAIL_RESEND_URL, data);
	return res.status(200).json(response.data);
});
