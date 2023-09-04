import axios from 'axios';

import { PASSWORD_CHANGE_URL } from '../../../../config/services';
import handler from '../../../../middlewares';
import { NextErrorMessage } from '../../../../utils/classes';
import { passwordChangeSchema } from '../../../../validators/auth';

export default handler().post(async function (req, res) {
	const data = await passwordChangeSchema.validate(
		{ ...req.body },
		{
			abortEarly: false,
			stripUnknown: true,
		}
	);

	if (data.newPassword1 !== data.newPassword2)
		throw new NextErrorMessage(400, 'Passwords do not match');

	const response = await axios.post(PASSWORD_CHANGE_URL, data);
	return res.status(200).json(response.data);
});
