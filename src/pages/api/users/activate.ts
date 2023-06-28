import permissions from '../../../config/permissions';
import prisma from '../../../db';
import { getUserObjectPermissions } from '../../../db/utils/permission';
import { admin } from '../../../middlewares';
import { hasModelPermission } from '../../../utils/permission';
import { NextApiErrorMessage } from '../../../utils/classes';
import { multipleEmailSchema } from '../../../validators';

export default admin().post(async (req, res) => {
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

	const valid = await multipleEmailSchema.validate(
		{ emails },
		{ abortEarly: false }
	);

	let hasPerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [permissions.user.EDIT]);

	if (!hasPerm) {
		// get the users from the emails
		const users = await prisma.user.findMany({
			where: {
				email: {
					in: valid.emails,
				},
			},
			select: {
				id: true,
			},
		});
		// Check to make sure that the request user has edit permission on all provided emails
		const hasPerms = await Promise.all(
			users.map((user) =>
				getUserObjectPermissions({
					modelName: 'users',
					objectId: user.id,
					permission: 'EDIT',
					userId: req.user.id,
				})
			)
		);

		const hasEditPerm = hasPerms.every((perm) => perm.edit === true);
		if (hasEditPerm) hasPerm = true;
	}

	if (!hasPerm)
		throw new NextApiErrorMessage(
			403,
			valid.emails.length < 2
				? 'You are not authorized to activate nor deactivate this user!'
				: 'You are not authorized to activate nor deactivate some of the users provided!'
		);

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
