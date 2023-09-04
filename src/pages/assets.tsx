import axios, { AxiosError } from 'axios';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

import { DEFAULT_PAGINATION_SIZE } from '../config/app';
import { REQUEST_EMAIL_VERIFY_PAGE_URL } from '../config/routes';
import { ASSETS_URL, USER_DATA_URL } from '../config/services';
import Assets from '../containers/assets';
import type {
	AuthDataType,
	ResponseType,
	SuccessResponseType,
	GetAssetsResponseType,
} from '../types';
import Title from '../utils/components/title';

const Page = ({ data }: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title="Assets" />
		<Assets assets={data} />
	</>
);

export const getServerSideProps: GetServerSideProps = async () => {
	try {
		const [data, user] = await axios.all<GetAssetsResponseType['data'] | AuthDataType>([
			axios
				.get<GetAssetsResponseType>(ASSETS_URL + `?limit=${DEFAULT_PAGINATION_SIZE}`)
				.then((response) => response.data.data),
			axios
				.get<SuccessResponseType<AuthDataType>>(USER_DATA_URL)
				.then((response) => response.data.data),
		]);

		return {
			props: {
				auth: user,
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
					props: {
						notFound: true,
					},
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
};

export default Page;
