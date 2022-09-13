import type { NextApiRequest, NextApiResponse } from 'next';

import { prisma } from '../../../../../db';
import { createToken } from '../../../../../db/utils';
import { BaseResponseType } from '../../../../../types';
import { handlePrismaErrors } from '../../../../../validators';

async function handler(
	req: NextApiRequest,
	res: NextApiResponse<
		BaseResponseType<
			null,
			{
				email?: string;
			}
		>
	>
) {
	if (req.method !== 'POST') {
		res.setHeader('Allow', ['POST']);
		return res.status(405).json({
			status: 'error',
			message: `${req.method} Method is not allowed`,
		});
	}
	try {
		let { email } = req.body;
		if (email === undefined || email === null)
			return res.status(400).json({
				status: 'error',
				message: 'Email Address is required!',
				error: {
					email: 'Email Address is required!',
				},
			});

		email = email.toLowerCase();

		const user = await prisma.user.findUnique({
			where: {
				email,
			},
			select: {
				id: true,
				isActive: true,
				isEmailVerified: true,
			},
		});

		if (user) {
			if (user.isActive === false) {
				return res.status(400).json({
					status: 'error',
					message:
						'Unable to complete request. Please contact customer support.',
				});
			}

			// Run the util function to create and send a new token
			createToken({
				uid: user.id,
				type: 'PASSWORD_RESET',
			}).catch((error) => {
				throw error;
			});

			return res.status(200).json({
				status: 'error',
				message:
					'Password reset token has been sent to your email and will expire in 24 hours.',
			});
		} else {
			return res.status(400).json({
				status: 'error',
				message: 'User with this email address does not exist',
				error: {
					email: 'User with this email address does not exist',
				},
			});
		}
	} catch (error) {
		const err = handlePrismaErrors(error);
		return res.status(err.code || 500).json(err);
	}
}

export default handler;
