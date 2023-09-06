import { AxiosError } from 'axios';
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

import { DEFAULT_PAGINATION_SIZE } from '../../config/app';
import { REQUEST_EMAIL_VERIFY_PAGE_URL } from '../../config/routes';
import { USER_DATA_URL } from '../../config/services';
import { authPage } from '../../middlewares';
import type { AuthDataType, ResponseType, SuccessResponseType } from '../../types';
import { axiosJn } from '../../utils/axios';

type ServerDataReturnType<P> =
	| {
			data: P;
			auth?: AuthDataType;
	  }
	| {
			errorPage: {
				statusCode?: number;
				title?: string;
			};
	  };

async function getServerSideData<P = any>({
	req,
	res,
	url,
	paginate = true,
}: {
	req?: GetServerSidePropsContext<any, any>['req'];
	res?: GetServerSidePropsContext<any, any>['res'];
	url: string;
	paginate?: boolean;
}): Promise<GetServerSidePropsResult<ServerDataReturnType<P>>> {
	try {
		let route = url;
		if (paginate) route + `?limit=${DEFAULT_PAGINATION_SIZE}`;

		// check that the user is logged in
		if (req && res) {
			try {
				await authPage().run(req, res);
			} catch (err) {
				if (+(process.env.TEST_MODE || 0) === 1) {
					console.log('AUTHENTICATE SERVER SIDE DATA ERROR :>> ', err);
				}
			}
		}

		const data = await axiosJn(req)
			.get<P>(route)
			.then((response) => response.data);

		const auth = await axiosJn(req)
			.get<SuccessResponseType<AuthDataType>>(USER_DATA_URL)
			.then((response) => response.data.data);

		return {
			props: {
				auth,
				data,
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
					data: {} as P,
					errorPage: {
						statusCode: response?.status || 500,
						title: response?.data.message || response?.statusText,
					},
				},
			};
		}
		return {
			props: {
				data: {} as P,
				errorPage: {
					statusCode: 500,
				},
			},
		};
	}
}

export default getServerSideData;
