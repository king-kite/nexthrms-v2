import { prisma } from '../../../../db';
import { auth } from '../../../../middlewares';
import { hashPassword } from '../../../../utils/bcrypt';
import { changeUserPasswordSchema } from '../../../../validators';

export default auth().post(async (req, res) => {
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

	const {
		email,
		password1,
	}: { email: string; password1: string; password2: string } =
		await changeUserPasswordSchema.validateAsync({ ...req.body });
	// Used emails and not IDs so schema and api route can be used by
	// users, employees and clients since they each have a unique
	// accessible email on get

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
