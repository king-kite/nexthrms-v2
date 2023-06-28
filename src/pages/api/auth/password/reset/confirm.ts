import type { NextApiRequest, NextApiResponse } from 'next';

import prisma from '../../../../../db';
import { BaseResponseType } from '../../../../../types';
import { comparePassword, hashPassword } from '../../../../../utils/bcrypt';
import { handleYupErrors, handlePrismaErrors } from '../../../../../validators';
import { passwordResetSchema } from '../../../../../validators/auth';

async function handler(
	req: NextApiRequest,
	res: NextApiResponse<
		BaseResponseType<
			null,
			{
				uid?: string;
				token?: string;
				password1?: string;
				password2?: string;
			}
		>
	>
) {
	// if req.method is not post return 405 error
	if (req.method !== 'POST') {
		return res.status(405).json({
			status: 'error',
			message: `${req.method} Method is not allowed`,
		});
	}

	try {
		// validate the request body
		const valid = await passwordResetSchema.validate({ ...req.body });

		// Check if both passwords are the same
		if (valid.password1 !== valid.password2) {
			return res.status(400).json({
				status: 'error',
				message: 'Passwords do not match',
				error: {
					password1: 'Passwords do not match',
					password2: 'Passwords do not match',
				},
			});
		}

		// Get the token provided in the request body
		const savedToken = await prisma.token.findUnique({
			where: {
				token: valid.token,
			},
		});

		// Return a 400 error is token is not found, expired or
		// the user id saved on the token is not the same as the uid
		// in the request body
		if (
			!savedToken ||
			savedToken.expires.getTime() <= Date.now() ||
			savedToken.uid !== valid.uid
		) {
			return res.status(400).json({
				status: 'error',
				message: 'Invalid Token',
				error: {
					token: 'Token is not valid or has expired!',
				},
			});
		}

		// Get the user using the uid in the request body
		const user = await prisma.user.findUnique({
			where: {
				id: valid.uid,
			},
			select: {
				id: true,
				password: true,
				isActive: true,
				isEmailVerified: true,
			},
		});

		// Return a 400 error if the user is not found or is inactive
		if (!user) {
			return res.status(400).json({
				status: 'error',
				message: 'Invalid Token',
				error: {
					token: 'Token is not valid or has expired!',
				},
			});
		} else if (user.isActive === false) {
			return res.status(400).json({
				status: 'error',
				message: 'Unable to reset password. Please contact customer support',
			});
		}

		// Return a 400 error if the new password is the same as the old password
		const comparedPassword = await comparePassword(
			valid.password1,
			user.password
		);
		if (comparedPassword)
			return res.status(400).json({
				status: 'error',
				message:
					'Password is the same as old password. Please enter a new password',
				error: {
					password1:
						'Password is the same as old password. Please enter a new password',
				},
			});

		// hash the new password
		const newPassword = await hashPassword(valid.password1);

		// delete the token
		await prisma.token.delete({
			where: {
				token: valid.token,
			},
		});

		// update the user's password
		await prisma.user.update({
			where: {
				id: user.id,
			},
			data: {
				password: newPassword,
				isEmailVerified: true,
			},
		});

		return res.status(200).json({
			status: 'success',
			message: 'Password reset was successful.',
		});
	} catch (err) {
		const joiError = handleYupErrors<{
			uid?: string;
			token?: string;
			password1?: string;
			password2?: string;
		}>(err);
		if (joiError)
			return res.status(400).json({
				message: 'Invalid Data',
				status: 'error',
				error: joiError,
			});
		const prismaError = handlePrismaErrors(err);
		return res.status(prismaError?.code || 500).json(prismaError);
	}
}

export default handler;
