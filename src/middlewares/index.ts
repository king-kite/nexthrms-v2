import type { NextApiResponse } from 'next';
import nextConnect, { NextConnect } from 'next-connect';

import { adminMiddleware, authMiddleware, employeeMiddleware } from './api';
import { authPagesMiddleware } from './pages';
import {
	NextApiRequestExtendUser,
	NextApiRequestExtendEmployee,
} from '../types';
import { NextApiErrorMessage } from '../utils/classes';
import { handleJoiErrors, handleYupErrors, handlePrismaErrors } from '../validators';

export function auth() {
	return nextConnect<NextApiRequestExtendUser, NextApiResponse>({
		onError(err, req, res) {
			if (err instanceof NextApiErrorMessage) {
				return res.status(err.status).json({
					status: 'error',
					message:
						err.status === 403
							? err.message || 'You are not authorized to make this request!'
							: err.status === 404
							? err.message || 'The request data does not exist'
							: err.message,
				});
			}
			const joiError = handleJoiErrors(err);
			if (joiError)
				return res.status(400).json({
					status: 'error',
					message: 'Invalid Data!',
					error: joiError,
				});
			const yupError = handleYupErrors(err);
			if (yupError) 
				return res.status(400).json({
					status: 'error',
					message: 'Invalid Data!',
					error: yupError,
				});
			const error = handlePrismaErrors(err);
			return res.status(error.code || 500).json(error);
		},
		onNoMatch(req, res) {
			return res.status(405).json({
				status: 'error',
				message: `'${req.method}' method not allowed!`,
			});
		},
	}).use(authMiddleware);
}

export function admin() {
	return auth().use(adminMiddleware);
}

export function employee(): NextConnect<
	NextApiRequestExtendEmployee,
	NextApiResponse<any>
> {
	return auth().use(employeeMiddleware);
}

export function authPage() {
	return nextConnect().use(authPagesMiddleware);
}

// use base().run(req, res) in GetServerSideProps
