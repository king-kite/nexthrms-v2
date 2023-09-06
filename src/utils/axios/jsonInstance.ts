import axios from 'axios';
import type { NextApiRequest } from 'next';

import { getToken } from '../tokens';

const axiosInstance = axios.create();

axiosInstance.defaults.headers.common['Accept'] = 'application/json';
axiosInstance.defaults.headers.common['Content-Type'] = 'application/json';

function axiosFn(req: NextApiRequest) {
	const token = getToken(req, 'access');
	if (token) axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + token;

	return axiosInstance;
}

export default axiosFn;
