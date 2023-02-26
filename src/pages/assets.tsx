import React from 'react';

import { LOGIN_PAGE_URL } from '../config';
import Assets from '../containers/assets';
import { getAssets } from '../db';
import { authPage } from '../middlewares';
import { ExtendedGetServerSideProps, GetAssetsResponseType } from '../types';
import { Title } from '../utils';
import { serializeUserData } from '../utils/serializers';

const Page = ({ data }: { data: GetAssetsResponseType['data'] }) => (
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
	const data = await getAssets();

	return {
		props: {
			auth,
			data: JSON.parse(JSON.stringify(data)),
		},
	};
};

export default Page;
