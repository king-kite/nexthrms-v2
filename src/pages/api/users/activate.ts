import { ACTIVATE_USER_URL } from '../../../config/services';
import { auth } from '../../../middlewares';
import { axiosJn } from '../../../utils/axios';
import { NextErrorMessage } from '../../../utils/classes';
import { multipleEmailSchema } from '../../../validators';

export default auth().post(async function (req, res) {
	const { action, emails } = req.body;
	if (!action || !emails)
		throw new NextErrorMessage(
			400,
			'Invalid Data. "emails" array is required and an action to ' +
				"'activate' or 'deactivate' is also required"
		);

	if (action !== 'activate' && action !== 'deactivate')
		throw new NextErrorMessage(400, 'Invalid action.', {
			action: 'Invalid Action. An action can must be ' + "'activate' or 'deactivate'",
		});

	if (emails.length < 1)
		throw new NextErrorMessage(400, 'No user ID was sent.', {
			emails: 'No User ID sent.',
		});

	// Used emails and not IDs so schema and api route can be used by
	// users, employees and clients since they each have a unique
	// accessible email on get.

	const valid = await multipleEmailSchema.validate({ emails }, { abortEarly: false });

	const response = await axiosJn(req).post(ACTIVATE_USER_URL, {
		action,
		emails: valid.emails,
	});
	return res.status(200).json(response.data);
});
