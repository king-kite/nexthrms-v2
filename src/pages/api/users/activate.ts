import { prisma } from '../../../db';
import { auth } from '../../../middlewares';
import { multipleEmailSchema } from '../../../validators';

export default auth().post(async (req, res) => {
	const { action, emails } = req.body;
	if (!action || !emails) {
		return res.status(400).json({
			status: 'error',
			message:
				'Invalid Data. "emails" array is required and an action to ' +
				"'activate' or 'deactivate' is also required",
		});
	}

	if (action !== 'activate' && action !== 'deactivate') {
		return res.status(400).json({
			status: 'error',
			message: 'Invalid Data!',
			error: {
				action:
					'Invalid Action. An action can must be ' +
					"'activate' or 'deactivate'",
			},
		});
	}

	if (emails.length < 1) {
		return res.status(400).json({
			status: 'error',
			message: 'Invalid Data!',
			error: {
				emails: 'No User ID sent!',
			},
		});
	}

	// Used emails and not IDs so schema and api route can be used by
	// users, employees and clients since they each have a unique
	// accessible email on get.

	const valid: {
		emails: string[];
	} = await multipleEmailSchema.validateAsync({ emails });

	await prisma.user.updateMany({
		where: {
			email: {
				in: valid.emails,
			},
		},
		data: {
			isActive: action === 'deactivate' ? false : true,
		},
	});

	return res.status(200).json({
		status: 'success',
		message:
			'User' + (emails.length > 1 ? 's ' : ' ') + action + 'd successfully!',
	});
});
