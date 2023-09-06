import axios from 'axios';
import type { NextApiRequest } from 'next';

import { getToken } from '../tokens';

const axiosInstance = axios.create();

function axiosFn(req?: NextApiRequest) {
	if (req) {
		const token = getToken(req, 'access');
		if (token) axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + token;
	}

	return axiosInstance;
}

export default axiosFn;
