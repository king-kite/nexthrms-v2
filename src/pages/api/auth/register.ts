import type { NextApiRequest, NextApiResponse } from 'next';

import { prisma } from '../../../db';
import { createToken } from '../../../db/utils';
import { RegisterResponseType } from '../../../types';
import { hashPassword } from '../../../utils/bcrypt';
import {
	handleJoiErrors,
	handlePrismaErrors,
	registerSchema,
} from '../../../validators';

async function handler(
	req: NextApiRequest,
	res: NextApiResponse<RegisterResponseType>
) {
	if (req.method !== 'POST') {
		res.setHeader('Allow', ['POST']);
		return res.status(405).json({
			message: `'${req.method}' Method is not allowed'`,
			status: 'error',
		});
	}
	try {
		const valid: {
			email: string;
			password: string;
			firstName?: string;
			lastName?: string;
		} = await registerSchema.validateAsync(
			{ ...req.body },
			{
				abortEarly: false,
			}
		);

		const hash = await hashPassword(valid.password);

		const data = {
			...valid,
			email: valid.email.toLowerCase().trim(),
			password: hash,
			profile: {
				create: {},
			},
		};

		const user = await prisma.user.create({
			data,
			select: {
				id: true,
				profile: {
					select: {
						id: true,
					},
				},
			},
		});

		// Run the util function to create and send a new token
		createToken({
			uid: user.id,
			type: 'EMAIL_VERIFICATION',
		}).catch((error) => {
			throw error;
		});

		return res.status(201).json({
			message:
				'Created user successfully. A verification email will be sent to your email address.',
			status: 'success',
		});
	} catch (err) {
		const joiError = handleJoiErrors(err);
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
