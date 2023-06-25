import { prisma } from '../../../../db';
import { auth } from '../../../../middlewares';
import { hashPassword } from '../../../../utils/bcrypt';
import { passwordChangeSchema } from '../../../../validators/auth';

export default auth().post(async (req, res) => {
	const valid = await passwordChangeSchema.validate(
		{ ...req.body },
		{ abortEarly: false }
	);

	if (valid.newPassword1 !== valid.newPassword2) {
		return res.status(400).json({
			status: 'error',
			message: 'Passwords do not match',
		});
	}

	const confirmOldPassword = await req.user.checkPassword(valid.oldPassword);
	if (confirmOldPassword) {
		if (valid.oldPassword === valid.newPassword1) {
			return res.status(400).json({
				status: 'error',
				message: 'Old password and New password cannot be the same',
			});
		}

		const newPassword = await hashPassword(valid.newPassword1);

		await prisma.user.update({
			where: {
				id: req.user.id,
			},
			data: {
				password: newPassword,
			},
		});

		return res.status(200).json({
			status: 'success',
			message: 'Password changed successfully!',
		});
	} else {
		return res.status(400).json({
			status: 'error',
			message: 'Old password is not valid!',
			error: {
				oldPassword: 'Old password is incorrect',
			},
		});
	}
});
