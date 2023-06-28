import permissions from '../../../../config/permissions';
import prisma from '../../../../db';
import { getUserObjectPermissions } from '../../../../db/utils/permission';
import { admin } from '../../../../middlewares';
import { hasModelPermission } from '../../../../utils/permission';
import { hashPassword } from '../../../../utils/bcrypt';
import { NextApiErrorMessage } from '../../../../utils/classes';
import { changeUserPasswordSchema } from '../../../../validators/users';

export default admin().post(async (req, res) => {
	if (!req.body.email || !req.body.password1 || !req.body.password2) {
		return res.status(400).json({
			status: 'error',
			message: "'email', 'password1' and 'password2' fields are required!",
		});
	} else if (req.body.password1 !== req.body.password2) {
		return res.status(400).json({
			status: 'error',
			message: 'Invalid Data!',
			error: {
				password1: 'Passwords do not match',
			},
		});
	}

	const { email, password1 } = await changeUserPasswordSchema.validate(
		{ ...req.body },
		{ abortEarly: false }
	);
	// Used emails and not IDs so schema and api route can be used by
	// users, employees and clients since they each have a unique
	// accessible email on get

	let hasPerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [permissions.user.EDIT]);

	if (!hasPerm) {
		// check if the user has a view object permission for this record
		// get the user
		const user = await prisma.user.findUnique({
			where: { email },
			select: { id: true },
		});
		if (!user)
			return res.status(404).json({
				status: 'error',
				message: 'User with specified email address was not found!',
			});
		const objPerm = await getUserObjectPermissions({
			modelName: 'users',
			objectId: user.id,
			permission: 'EDIT',
			userId: req.user.id,
		});
		if (objPerm.edit === true) hasPerm = true;
	}

	if (!hasPerm) throw new NextApiErrorMessage(403);

	await prisma.user.update({
		where: {
			email,
		},
		data: {
			password: await hashPassword(password1),
		},
	});

	return res.status(200).json({
		status: 'success',
		message: 'Password changed successfully!',
	});
});
