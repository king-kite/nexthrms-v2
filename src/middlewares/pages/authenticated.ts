import cookie from 'cookie';
import { ServerResponse } from 'http';
import jwt, { JwtPayload } from 'jsonwebtoken';
import type { GetServerSidePropsContext } from 'next';
import { NextHandler } from 'next-connect';

import {
	ACCESS_TOKEN,
	REFRESH_TOKEN,
	ACCESS_TOKEN_LIFETIME,
	REFRESH_TOKEN_LIFETIME,
} from '../../config';
import { SECRET_KEY } from '../../config/settings';
import prisma from '../../db';
import { authSelectQuery } from '../../db/queries/auth';
import {
	PermissionType,
	RequestUserType as BaseRequestUserType,
} from '../../types';
import { getDistinctPermissions } from '../../utils/serializers';
import { createJWT, setTokens } from '../../utils/tokens';

type RequestUserType = Omit<BaseRequestUserType, 'checkPassword'>;
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

		return {
			...user,
			fullName: user.firstName + ' ' + user.lastName,
			allPermissions: getDistinctPermissions([
				...user.permissions,
				...user.groups.reduce((acc: PermissionType[], group) => {
					return [...acc, ...group.permissions];
				}, []),
			]),
		};
	} catch (error) {
		if (process.env.NODE_ENV === 'development') {
			console.log('AUTH PAGE MIDDLEWARE :>> ', error);
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

type RequestType = GetServerSidePropsContext['req'] & {
	user?: RequestUserType;
};

const authMiddleware = async (
	req: RequestType,
	res: ServerResponse,
	next: NextHandler
) => {
	// Throw an error if SECRET_KEY is not set in the environment varibales
	if (SECRET_KEY === undefined) {
		throw new Error("SET 'SECRET_KEY' in the environment variables");
	}

	// Get the cookies from the request headers
	const cookies = cookie.parse(req.headers.cookie || '');

	// Get the access and refresh token from the cookies
	const access = cookies[ACCESS_TOKEN] || undefined;
	const refresh = cookies[REFRESH_TOKEN] || undefined;

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
				req.user = user;
			}
		}
	} else if (refresh) {
		// Verify the refresh token, if valid generate a new access and refresh tokens
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
			}
		}
	}

	next();
};

export default authMiddleware;
