import type { InferGetServerSidePropsType } from 'next';
import React from 'react';

import { DEFAULT_PAGINATION_SIZE, LOGIN_PAGE_URL } from '../../../config';
import User from '../../../containers/Users/Detail';
import { getUser, getUserGroups, getUserPermissions } from '../../../db';
import { authPage } from '../../../middlewares';
import { ExtendedGetServerSideProps } from '../../../types';
import { Title } from '../../../utils';
import { serializeUserData } from '../../../utils/serializers';

const Page = ({
	data,
	groups,
	permissions,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<React.Fragment>
		<Title title="User Information" />
		<User groups={groups} permissions={permissions} user={data} />
	</React.Fragment>
);

export const getServerSideProps: ExtendedGetServerSideProps = async ({
	req,
	res,
	params,
}) => {
	try {
		await authPage().run(req, res);
	} catch (error) {
		if (process.env.NODE_ENV === 'development')
			console.log('USER PAGE :>> ', error);
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
	const data = await getUser(params?.id as string);
	const groups = await getUserGroups(params?.id as string, {
		limit: DEFAULT_PAGINATION_SIZE,
		offset: 0,
		search: '',
	});
	const permissions = await getUserPermissions(params?.id as string, {
		limit: DEFAULT_PAGINATION_SIZE,
		offset: 0,
		search: '',
	});

	if (!data) {
		return {
			notFound: true,
		};
	}

	return {
		props: {
			auth,
			data: JSON.parse(JSON.stringify(data)),
			groups: JSON.parse(JSON.stringify(groups)),
			permissions: JSON.parse(JSON.stringify(permissions)),
		},
	};
};

export default Page;
