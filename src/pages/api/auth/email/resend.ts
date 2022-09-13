import type { NextApiRequest, NextApiResponse } from 'next';

import { prisma } from '../../../../db';
import { createToken } from '../../../../db/utils';
import { BaseResponseType } from '../../../../types';
import { handlePrismaErrors } from '../../../../validators';

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
	// Only allow Post requests
	if (req.method !== 'POST') {
		res.setHeader('Allow', ['POST']);
		return res.status(405).json({
			status: 'error',
			message: `${req.method} Method is not allowed`,
		});
	}

	try {
		// Get the email from the body
		let { email } = req.body;
		if (email === undefined || email === null) {
			return res.status(400).json({
				status: 'error',
				message: 'Email address is required!',
				error: {
					email: 'Email address is required!',
				},
			});
		}

		email = email.toLowerCase();

		// get user
		const user = await prisma.user.findUnique({
			where: {
				email,
			},
			select: {
				id: true,
				isEmailVerified: true,
			},
		});

		// if user does not exist or email is verified
		if (!user) {
			return res.status(404).json({
				status: 'error',
				message: 'User with specified email address does not exists',
				error: {
					email: 'User with specified email address does not exists',
				},
			});
		} else if (user.isEmailVerified === true) {
			return res.status(400).json({
				status: 'error',
				message: 'Email address is already verified',
				error: {
					email: 'Email address is already verified',
				},
			});
		}

		// Run the util function to create and send a new token
		createToken({
			uid: user.id,
			type: 'EMAIL_VERIFICATION',
		}).catch((error) => {
			throw error;
		});

		return res.status(200).json({
			status: 'success',
			message: 'Verification email sent',
		});
	} catch (error) {
		const err = handlePrismaErrors(error);
		return res.status(err.code || 500).json(err);
	}
}

export default handler;
