import axios from 'axios';
import { IncomingMessage } from 'http';
import type { NextApiRequest } from 'next';
import { NextApiRequestCookies } from 'next/dist/server/api-utils';

import { getToken } from '../tokens';

const axiosInstance = axios.create();

axiosInstance.defaults.headers.common['Accept'] = 'application/json';
axiosInstance.defaults.headers.common['Content-Type'] = 'application/json';

type RequestType =
	| NextApiRequest
	| (IncomingMessage & {
			cookies: NextApiRequestCookies;
	  });

function axiosFn(req?: RequestType) {
	if (req) {
		const token = getToken(req, 'access');
		if (token) axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + token;
	}
	return axiosInstance;
}

export default axiosFn;
