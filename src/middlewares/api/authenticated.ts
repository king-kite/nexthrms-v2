import cookie from 'cookie';
import jwt, { JwtPayload } from 'jsonwebtoken';
import type { NextApiResponse } from 'next';
import { NextHandler } from 'next-connect';

import {
	ACCESS_TOKEN,
	REFRESH_TOKEN,
	ACCESS_TOKEN_LIFETIME,
	REFRESH_TOKEN_LIFETIME,
	REQUEST_EMAIL_VERIFY_PAGE_URL,
} from '../../config';
import { EMAIL_VERIFICATION_REQUIRED, SECRET_KEY } from '../../config/settings';
import { prisma, authSelectQuery } from '../../db';
import { NextApiRequestExtendUser, RequestUserType } from '../../types';
import { comparePassword } from '../../utils/bcrypt';
import { createJWT, setTokens } from '../../utils/tokens';

// Authentication Required Middleware

// Check the tokens are valid, find the user,
// Verify the user is still active
// and pass the user object as a context to the
// next api handler function

async function getUser(id: string): Promise<RequestUserType | null> {
	try {
		const { password, ...user } = await prisma.user.findUniqueOrThrow({
			where: { id },
			select: authSelectQuery,
		});

		const checkPassword = async (_password: string) => {
			return await comparePassword(_password, password);
		};

		return {
			...user,
			fullName: user.firstName + ' ' + user.lastName,
			checkPassword,
		};
	} catch (error) {
		if (process.env.NODE_ENV === 'development') {
			console.log('AUTH MIDDLEWARE :>> ', error);
		}
		return null;
	}
}

function verifyToken({
	token,
	type,
	secret,
}: {
	token: string;
	type: 'access' | 'refresh';
	secret: string;
}): {
	id: string | null;
	error?: unknown;
} {
	try {
		const decoded = jwt.verify(token, secret) as JwtPayload;
		if (decoded && 'type' in decoded && decoded.type === type) {
			return { id: decoded.id };
		}
		return { id: null, error: `Unable to verify ${type} token` };
	} catch (error) {
		return { id: null, error: `Unable to verify ${type} token` };
	}
}

const authMiddleware = async (
	req: NextApiRequestExtendUser,
	res: NextApiResponse,
	next: NextHandler
) => {
	// Throw an error if SECRET_KEY is not set in the environment varibales
	if (SECRET_KEY === undefined) {
		throw new Error("SET 'SECRET_KEY' in the environment variables");
	}
	try {
		// Get the cookies from the request headers
		const cookies = cookie.parse(req.headers.cookie || '');

		// Get the access token from the cookies
		const access = cookies[ACCESS_TOKEN] || undefined;

		// Verify the access token and continue if valid
		if (access) {
			const { id } = verifyToken({
				token: access,
				secret: SECRET_KEY,
				type: 'access',
			});
			if (id) {
				const user = await getUser(id);

				// Check if user exists
				if (user) {
					// Check if user email is verified
					if (user.isEmailVerified === false && EMAIL_VERIFICATION_REQUIRED) {
						return res.status(307).json({
							status: 'redirect',
							message: 'Email is not verified',
							redirect: {
								url: REQUEST_EMAIL_VERIFY_PAGE_URL,
							},
						});
					}

					// Check if user is active
					if (user.isActive === false) {
						return res.status(401).json({
							status: 'error',
							message:
								'Unable to complete request. Please contact customer support.',
						});
					}

					// if user is active and email is verfied
					req.user = user;
					return next();
				} else {
					// Return 401 error if the user is not found or inactive
					return res.status(401).json({
						message: 'Authentication credentials were not provided!',
						status: 'error',
					});
				}
			}
		}

		// Get the refresh token from the cookies
		const refresh = cookies[REFRESH_TOKEN] || undefined;

		// Verify the refresh token, if valid generate a new access and refresh token
		if (refresh) {
			const { id } = verifyToken({
				token: refresh,
				secret: SECRET_KEY,
				type: 'refresh',
			});
			if (id) {
				// if refresh token is valid, check if the user exists and is still active
				const user = await getUser(id);

				// Check if user exists
				if (user) {
					// Check if user email is verified
					if (user.isEmailVerified === false && EMAIL_VERIFICATION_REQUIRED) {
						return res.status(307).json({
							status: 'redirect',
							message: 'Email is not verified',
							redirect: {
								url: REQUEST_EMAIL_VERIFY_PAGE_URL,
							},
						});
					}

					// Check if user is active
					if (user.isActive === false) {
						return res.status(401).json({
							status: 'error',
							message:
								'Unable to complete request. Please contact customer support.',
						});
					}

					const newAccessToken = createJWT(
						{
							id: user.id,
							type: 'access',
						},
						{ expiresIn: ACCESS_TOKEN_LIFETIME }
					);
					const newRefreshToken = createJWT(
						{
							id: user.id,
							type: 'refresh',
						},
						{ expiresIn: REFRESH_TOKEN_LIFETIME }
					);

					req.user = user;
					setTokens(res, newAccessToken, newRefreshToken);
					// if user is active and email is verfied
					return next();
				}
			}
		}

		// Return 401 error if the authentication process failed
		return res.status(401).json({
			message: 'Authentication credentials were not provided!',
			status: 'error',
		});
	} catch (err) {
		const message =
			process.env.NODE_ENV === 'development'
				? (err as any)?.message || 'Internal Server Error!'
				: 'Internal Server Error!';
		return res.status(500).json({
			message,
			status: 'error',
		});
	}
};

export default authMiddleware;
