import axios from 'axios';
import type { InferGetServerSidePropsType } from 'next';

import { DEFAULT_PAGINATION_SIZE } from '../config/app';
import { ASSETS_URL } from '../config/services';
import Assets from '../containers/assets';
import { authPage } from '../middlewares';
import { ExtendedGetServerSideProps, GetAssetsResponseType } from '../types';
import Title from '../utils/components/title';

const Page = ({ data }: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title="Assets" />
		<Assets assets={data} />
	</>
);

export const getServerSideProps: ExtendedGetServerSideProps = async ({ req, res }) => {
	try {
		await authPage().run(req, res);
	} catch (error) {
		return {
			props: {
				auth: null,
				errorPage: {
					statusCode: 401,
				},
			},
		};
	}

	if (!req.user) {
		return {
			props: {
				auth: null,
				errorPage: {
					statusCode: 401,
				},
			},
		};
	}

	// Must be admin user
	if (!req.user.isSuperUser && !req.user.isAdmin) {
		return {
			props: {
				auth: req.user,
				errorPage: {
					statusCode: 403,
				},
			},
		};
	}

	const response = await axios.get<GetAssetsResponseType>(
		ASSETS_URL + `?limit=${DEFAULT_PAGINATION_SIZE}`
	);

	if (response.status === 200 && response.data.status === 'success') {
		return {
			props: {
				auth: req.user,
				data: response.data.data,
			},
		};
	}

	if (response.status === 404) {
		return {
			props: {
				notFound: true,
			},
		};
	}

	return {
		props: {
			auth: req.user,
			errorPage: {
				statusCode: response.status,
				title: response.data.message || response.statusText,
			},
		},
	};
};

export default Page;
