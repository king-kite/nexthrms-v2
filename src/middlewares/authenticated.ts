import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Middleware } from 'next-connect';

import { REFRESH_TOKEN_URL } from '../config/services';
import type { SuccessResponseType } from '../types';
import { NextErrorMessage } from '../utils/classes';
import { getToken, setTokens } from '../utils/tokens';

const authenticated: Middleware<NextApiRequest, NextApiResponse> = async function (req, res, next) {
	// If the access token if still in the cookie
	const accessToken = getToken(req, 'access');
	if (accessToken) return next();

	// If the refresh token is there then refresh the token
	const refreshToken = getToken(req, 'refresh');
	if (refreshToken) {
		const response = await axios.post<SuccessResponseType<{ access: string; refresh: string }>>(
			REFRESH_TOKEN_URL,
			{ refresh: refreshToken },
			{
				headers: {
					accept: 'application/json',
					'content-type': 'application/json',
				},
			}
		);

		const tokens = response.data.data;

		// set the new tokens
		setTokens(res, tokens.access, tokens.refresh);
		next();
	}

	throw new NextErrorMessage(401);
};

export default authenticated;
