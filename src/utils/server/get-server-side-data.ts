import axios, { AxiosError } from 'axios';
import type { GetServerSidePropsResult } from 'next';

import { DEFAULT_PAGINATION_SIZE } from '../../config/app';
import { REQUEST_EMAIL_VERIFY_PAGE_URL } from '../../config/routes';
import { USER_DATA_URL } from '../../config/services';
import type { AuthDataType, ResponseType, SuccessResponseType } from '../../types';

type ServerDataReturnType<P> =
	| {
			data: P;
			user?: AuthDataType;
	  }
	| {
			errorPage: {
				statusCode?: number;
				title?: string;
			};
	  };

async function getServerSideData<P = any>({
	url,
	paginate = true,
}: {
	url: string;
	paginate?: boolean;
}): Promise<GetServerSidePropsResult<ServerDataReturnType<P>>> {
	try {
		let route = url;
		if (paginate) route + `?limit=${DEFAULT_PAGINATION_SIZE}`;
		const [data, user] = await axios.all<P | AuthDataType>([
			axios.get<P>(route).then((response) => response.data),
			axios
				.get<SuccessResponseType<AuthDataType>>(USER_DATA_URL)
				.then((response) => response.data.data),
		]);

		return {
			props: {
				user: user as AuthDataType,
				data: data as P,
			},
		};
	} catch (err) {
		if (err instanceof AxiosError) {
			const error = err as AxiosError<ResponseType<any>>;
			const response = error.response;
			if (
				response &&
				response.status === 307 &&
				response.data.status === 'redirect' &&
				response.data.data?.reason === 'email_verification'
			) {
				return {
					redirect: {
						destination: REQUEST_EMAIL_VERIFY_PAGE_URL,
						permanent: false,
					},
				};
			}

			if (response && response.status === 404) {
				return {
					notFound: true,
				};
			}

			return {
				props: {
					errorPage: {
						statusCode: response?.status || 500,
						title: response?.data.message || response?.statusText,
					},
				},
			};
		}
		return {
			props: {
				errorPage: {
					statusCode: 500,
				},
			},
		};
	}
}

export default getServerSideData;
