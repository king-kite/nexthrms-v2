import { AxiosError } from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';

import authenticated from './authenticated';
import type { ResponseType } from '../types';
import { NextErrorMessage } from '../utils/classes';
import { handleYupErrors } from '../validators/errors';

export function auth() {
	return handler().use(authenticated);
}

// To be used in pages getServerSideProps
export function authPage() {
	return nextConnect().use(authenticated);
}

function handler() {
	return nextConnect<NextApiRequest, NextApiResponse>({
		onNoMatch: (req, res) => {
			return res.status(405).json({
				status: 'error',
				message: `'${req.method}' method not allowed!`,
			});
		},
		onError: (err, req, res) => {
			if (err instanceof NextErrorMessage) {
				return res.status(err.status).json({
					status: 'error',
					message:
						err.status === 403
							? err.message || 'You are not authorized to make this request!'
							: err.status === 404
							? err.message || 'The request data does not exist'
							: err.message,
					data: err.data,
				});
			}
			const yupError = handleYupErrors(err);
			if (yupError)
				return res.status(400).json({
					status: 'error',
					message: 'Invalid Data.',
					data: yupError,
				});

			if (err instanceof AxiosError) {
				const error = err as AxiosError<ResponseType<any>>;
				if (error.response) {
					return res.status(error.response.status).json(error.response.data);
				}
			}
			return res.status(500).json({
				status: 'error',
				message: 'Something went wrong.',
			});
		},
	});
}

export default handler;
