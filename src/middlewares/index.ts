import type { NextApiResponse } from 'next';
import nextConnect from 'next-connect';

import { adminMiddleware, authMiddleware } from './api';
import { adminPageMiddleware, authPagesMiddleware } from './pages';
import { NextApiRequestExtendUser } from '../types';
import { handleJoiErrors, handlePrismaErrors } from '../validators';

export function auth() {
	return nextConnect<NextApiRequestExtendUser, NextApiResponse>({
		onError(err, req, res) {
			const joiError = handleJoiErrors(err);
			if (joiError)
				return res.status(400).json({
					status: 'error',
					message: 'Invalid Data!',
					error: joiError,
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

export function authPage() {
	return nextConnect().use(authPagesMiddleware);
}

export function adminPage() {
	return authPage().use(adminPageMiddleware);
}

// use base().run(req, res) in GetServerSideProps
