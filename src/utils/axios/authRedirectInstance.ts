import axios, { AxiosError, AxiosResponse } from 'axios';
import Router from 'next/router';

import { LOGIN_PAGE_URL } from '../../config'
import { isResponseWithRedirect } from '../../validators';

const axiosInstance = axios.create();

function onFulfilled(response: AxiosResponse<any, any>) {
	return response;
}

function onRejected(error: unknown) {
	const err = error as AxiosError;
	if (err.response) {
		if (err.response.status === 401) {
			Router.push(LOGIN_PAGE_URL);
		} else if (
			err.response.status === 307 &&
			isResponseWithRedirect(err.response.data) &&
			err.response.data?.redirect?.url
		) {
			// TODO: Validate the redirect url
			Router.push(err.response.data.redirect.url);
		}
	}
	return Promise.reject(error);
}

axiosInstance.defaults.headers.common['Accept'] = 'application/json';
axiosInstance.defaults.headers.common['Content-Type'] = 'application/json';
axiosInstance.interceptors.response.use(onFulfilled, onRejected);

export default axiosInstance;
