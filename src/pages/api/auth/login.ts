import type { NextApiRequest, NextApiResponse } from 'next';

import {
	ACCESS_TOKEN_LIFETIME,
	REFRESH_TOKEN_LIFETIME,
	REQUEST_EMAIL_VERIFY_PAGE_URL,
} from '../../../config';
import { EMAIL_VERIFICATION_REQUIRED } from '../../../config/settings';
import { prisma } from '../../../db';
import { createToken } from '../../../db/utils';
import { AuthDataType, BaseResponseType } from '../../../types';
import { comparePassword } from '../../../utils/bcrypt';
import { createJWT, setTokens } from '../../../utils/tokens';
import {
	handleJoiErrors,
	handlePrismaErrors,
	loginSchema,
} from '../../../validators';

async function handler(
	req: NextApiRequest,
	res: NextApiResponse<
		BaseResponseType<
			AuthDataType | undefined,
			| {
					email?: string;
					password?: string;
			  }
			| undefined
		>
	>
) {
	if (req.method !== 'POST') {
		res.setHeader('Allow', ['POST']);
		return res.status(405).json({
			status: 'error',
			message: `'${req.method}' Method is not allowed'`,
		});
	}
	try {
		const valid = await loginSchema.validateAsync(
			{ ...req.body },
			{
				abortEarly: false,
			}
		);
		const { email, password } = valid;

		const user = await prisma.user.findUnique({
			where: {
				email: email.toLowerCase(),
			},
			select: {
				email: true,
				firstName: true,
				lastName: true,
				id: true,
				isActive: true,
				isEmailVerified: true,
				password: true,
				employee: {
					select: {
						id: true,
						job: {
							select: {
								name: true,
							},
						},
					},
				},
				profile: {
					select: {
						image: true,
					},
				},
			},
		});

		if (user) {
			if (user.isEmailVerified === false && EMAIL_VERIFICATION_REQUIRED) {
				// Run the util function to create and send a new token
				createToken({
					uid: user.id,
					type: 'EMAIL_VERIFICATION',
				}).catch((error) => {
					throw error;
				});

				return res.status(307).json({
					status: 'redirect',
					message: 'Email is not verified. A verification token has been sent.',
					redirect: {
						url: REQUEST_EMAIL_VERIFY_PAGE_URL,
					},
				});
			}

			if (user.isActive === false) {
				return res.status(400).json({
					status: 'error',
					message:
						'Unable to complete request. Please contact customer support',
				});
			}

			const confirmed = await comparePassword(password, user.password);
			if (confirmed === true) {
				const accessToken = createJWT(
					{
						id: user.id,
						type: 'access',
					},
					{ expiresIn: ACCESS_TOKEN_LIFETIME }
				);
				const refreshToken = createJWT(
					{
						id: user.id,
						type: 'refresh',
					},
					{ expiresIn: REFRESH_TOKEN_LIFETIME }
				);
				setTokens(res, accessToken, refreshToken);
				const data: AuthDataType = {
					firstName: user.firstName,
					lastName: user.lastName,
					email: user.email,
					fullName: user.firstName + " " + user.lastName,
					profile: null,
					employee: null,
				};
				if (user.profile) {
					data.profile = {
						image: user.profile.image,
					};
				}
				if (user.employee) {
					data.employee = {
						id: user.employee.id,
					};
					if (user.employee.job) {
						data.employee.job = {
							name: user.employee.job.name,
						};
					}
				}
				return res.status(200).json({
					status: 'success',
					message: 'Signed in successfully',
					data,
				});
			} else {
				return res.status(400).json({
					status: 'error',
					message: 'Incorrect Password. Unable to Sign In',
					error: {
						password: 'This password is incorrect!',
					},
				});
			}
		}

		return res.status(400).json({
			status: 'error',
			message:
				'Unable to sign in with provided credentials. Email is not found!',
			error: {
				email: 'User with email address does not exist!',
			},
		});
	} catch (err) {
		const joiError = handleJoiErrors<{
			email?: string;
			password?: string;
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
