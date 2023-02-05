import React from 'react';

import { LOGIN_PAGE_URL } from '../../config';
import Permissions from '../../containers/Users/Permissions';
import { getPermissions } from '../../db';
import { authPage } from '../../middlewares';
import {
	ExtendedGetServerSideProps,
	GetPermissionsResponseType,
} from '../../types';
import { Title } from '../../utils';
import { serializeUserData } from '../../utils/serializers';

const Page = ({ data }: { data: GetPermissionsResponseType['data'] }) => (
	<React.Fragment>
		<Title title="Permissions" />
		<Permissions permissions={data} />
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
			console.log('PERMISSIONS PAGE :>> ', error);
	}

	if (!req.user) {
		return {
			redirect: {
				destination: LOGIN_PAGE_URL,
				permanent: false,
			},
		};
	}

	const auth = serializeUserData(req.user);
	const data = await getPermissions();

	return {
		props: {
			auth,
			data: JSON.parse(JSON.stringify(data)),
		},
	};
};

export default Page;
