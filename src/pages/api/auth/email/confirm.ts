import type { NextApiRequest, NextApiResponse } from 'next';

import prisma from '../../../../db';
import { BaseResponseType } from '../../../../types';
import { handleYupErrors, handlePrismaErrors } from '../../../../validators';
import { verifyUidTokenSchema } from '../../../../validators/auth';

async function handler(
	req: NextApiRequest,
	res: NextApiResponse<
		BaseResponseType<
			null,
			{
				uid?: string;
				token?: string;
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
		const valid = await verifyUidTokenSchema.validate(
			{ ...req.body },
			{ abortEarly: false }
		);

		// Get the token provided in the request body
		const savedToken = await prisma.token.findUnique({
			where: {
				token: valid.token,
			},
			select: {
				expires: true,
				type: true,
				uid: true,
				token: true,
			},
		});

		// Return a 400 error is token is not found, expired or
		// is not an email verification token
		// the user id saved on the token is not the same as the uid
		// in the request body
		if (
			!savedToken ||
			savedToken.type !== 'EMAIL_VERIFICATION' ||
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

		// Set the user email as verified
		await prisma.user.update({
			where: {
				id: savedToken.uid,
			},
			data: {
				isEmailVerified: true,
			},
		});

		// Delete the token
		await prisma.token.delete({
			where: {
				token: savedToken.token,
			},
		});

		return res.status(200).json({
			status: 'success',
			message: 'Email verified successfully!',
		});
	} catch (err) {
		const joiError = handleYupErrors<{
			uid?: string;
			token?: string;
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
