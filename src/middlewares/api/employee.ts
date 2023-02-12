import type { NextApiResponse } from 'next';
import { NextHandler } from 'next-connect';

import { NextApiRequestExtendUser } from '../../types';

const employeeMiddleware = async (
	req: NextApiRequestExtendUser,
	res: NextApiResponse,
	next: NextHandler
) => {
	try {
		// Continue to the next route if the user is an employee
		if (req.user.employee !== null && req.user.employee !== undefined)
			return next();

		return res.status(403).json({
			status: 'error',
			message:
				'You are not authorized to perform this request. This request is reserved for employees only!',
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

export default employeeMiddleware;
