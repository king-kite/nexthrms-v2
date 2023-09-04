import axios from 'axios';

import { EMAIL_CONFIRM_URL } from '../../../../config/services';
import handler from '../../../../middlewares';
import { NextErrorMessage } from '../../../../utils/classes';

export default handler().post(async function (req, res) {
	// Get the email from the body
	let { email } = req.body;
	if (!email)
		throw new NextErrorMessage(400, 'Email address is required.', {
			email: 'Email address is required.',
		});

	const response = await axios.post(EMAIL_CONFIRM_URL, { email: email.toLowerCase() });
	return res.status(200).json(response.data);
});
