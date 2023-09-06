import cookie from 'cookie';
import type { ServerResponse } from 'http';
import type { NextApiRequest, NextApiResponse } from 'next';
import {
	ACCESS_TOKEN,
	REFRESH_TOKEN,
	ACCESS_TOKEN_LIFETIME,
	REFRESH_TOKEN_LIFETIME,
} from '../../config';

// NextApiRequest && NextApiResponse
export const removeTokens = (
	response: NextApiResponse | ServerResponse
): NextApiResponse | ServerResponse => {
	response.setHeader('Set-Cookie', [
		cookie.serialize(ACCESS_TOKEN, '', {
			expires: new Date(0),
			httpOnly: true,
			path: '/',
			sameSite: 'strict',
			secure: process.env.NODE_ENV !== 'development',
		}),
		cookie.serialize(REFRESH_TOKEN, '', {
			expires: new Date(0),
			httpOnly: true,
			path: '/',
			sameSite: 'strict',
			secure: process.env.NODE_ENV !== 'development',
		}),
	]);
	return response;
};

export const setTokens = (
	response: NextApiResponse | ServerResponse,
	access: string,
	refresh: string
): NextApiResponse | ServerResponse => {
	const date = new Date().getTime();
	response.setHeader('Set-Cookie', [
		cookie.serialize(ACCESS_TOKEN, access, {
			expires: new Date(date + ACCESS_TOKEN_LIFETIME * 1000),
			httpOnly: true,
			path: '/',
			sameSite: 'strict',
			secure: process.env.NODE_ENV !== 'development',
		}),
		cookie.serialize(REFRESH_TOKEN, refresh, {
			expires: new Date(date + REFRESH_TOKEN_LIFETIME * 1000),
			httpOnly: true,
			path: '/',
			sameSite: 'strict',
			secure: process.env.NODE_ENV !== 'development',
		}),
	]);
	return response;
};

export const getToken = (request: NextApiRequest, title: 'access' | 'refresh') => {
	const cookies = cookie.parse(request.headers.cookie || '');
	const token =
		cookies[title === 'access' ? ACCESS_TOKEN : title === 'refresh' ? REFRESH_TOKEN : title];
	if (token) return token;
	return '';
};

// export function generateToken(options?: {
// 	stringBase?: BufferEncoding;
// 	byteLength?: number;
// }): Promise<string> {
// 	return new Promise((resolve, reject) => {
// 		crypto.randomBytes(options?.byteLength || 48, (err, buffer) => {
// 			if (err) {
// 				reject(err);
// 			} else {
// 				resolve(buffer.toString(options?.stringBase || 'hex'));
// 				// resolve(buffer.toString(options?.stringBase || 'base64').replace(/\+/g, '-').replace(/\//g, '-').replace(/\=/g), '');
// 			}
// 		});
// 	});
// }
