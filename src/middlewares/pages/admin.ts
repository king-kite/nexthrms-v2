import { ServerResponse } from 'http';
import type { GetServerSidePropsContext } from 'next';
import { NextHandler } from 'next-connect';

import { RequestUserType as BaseRequestUserType } from '../../types';

type RequestType = GetServerSidePropsContext['req'] & {
	user?: BaseRequestUserType;
};

const adminMiddleware = async (
	req: RequestType,
	res: ServerResponse,
	next: NextHandler
) => {
	// Continue to the next route if the user is an admin or super user.
	if (req.user?.isSuperUser || req.user?.isAdmin) req.user.isAdmin = true;

	next();
};

export default adminMiddleware;
