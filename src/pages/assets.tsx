import { InferGetServerSidePropsType } from 'next';
import React from 'react';

import { DEFAULT_PAGINATION_SIZE, LOGIN_PAGE_URL } from '../config';
import Assets from '../containers/assets';
import { getAssets } from '../db';
import { getRecords } from '../db/utils';
import { authPage } from '../middlewares';
import { ExtendedGetServerSideProps, GetAssetsResponseType } from '../types';
import { Title } from '../utils';
import { serializeUserData } from '../utils/serializers';

const Page = ({
	data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<React.Fragment>
		<Title title="Assets" />
		<Assets assets={data} />
	</React.Fragment>
);

export const getServerSideProps: ExtendedGetServerSideProps = async ({
	req,
	res,
}) => {
	try {
		await authPage().run(req, res);
	} catch (error) {
		if (process.env.NODE_ENV === 'development')
			console.log('ASSETS PAGE :>> ', error);
	}

	if (!req.user) {
		return {
			redirect: {
				destination: LOGIN_PAGE_URL,
				permanent: false,
			},
		};
	}

	const auth = await serializeUserData(req.user);

	// Must be admin user
	if (!req.user.isSuperUser && !req.user.isAdmin) {
		return {
			props: {
				auth,
				errorPage: {
					statusCode: 403,
				},
			},
		};
	}

	const result = await getRecords<GetAssetsResponseType['data']>({
		model: 'assets',
		perm: 'asset',
		placeholder: {
			total: 0,
			result: [],
		},
		query: {
			limit: DEFAULT_PAGINATION_SIZE,
			offset: 0,
			search: '',
		},
		user: req.user,
		getData(params) {
			return getAssets(params);
		},
	});

	if (result) {
		return {
			props: {
				auth,
				data: result.data,
			},
		};
	}

	return {
		props: {
			auth,
			errorPage: {
				statusCode: 403,
			},
		},
	};
};

export default Page;
