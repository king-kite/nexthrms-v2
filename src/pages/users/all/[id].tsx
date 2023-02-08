import type { InferGetServerSidePropsType } from 'next';
import React from 'react';
import { ParsedUrlQuery } from 'querystring';

import { DEFAULT_PAGINATION_SIZE, LOGIN_PAGE_URL } from '../../../config';
import User from '../../../containers/Users/Detail';
import { getUser, getUserPermissions } from '../../../db';
import { authPage } from '../../../middlewares';
import { ExtendedGetServerSideProps, UserType } from '../../../types';
import { Title } from '../../../utils';
import { serializeUserData } from '../../../utils/serializers';

const Page = ({
	data,
	permissions,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<React.Fragment>
		<Title title="User Information" />
		<User permissions={permissions} user={data} />
	</React.Fragment>
);

interface IParams extends ParsedUrlQuery {
	id: string;
}

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

	const auth = serializeUserData(req.user);
	const data = await getUser(params?.id as IParams['id']);
	const permissions = await getUserPermissions(params?.id as IParams['id'], {
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
			permissions: JSON.parse(JSON.stringify(permissions)),
		},
	};
};

export default Page;
