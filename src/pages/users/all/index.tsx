import type { InferGetServerSidePropsType } from 'next';
import React from 'react';

import { DEFAULT_PAGINATION_SIZE, LOGIN_PAGE_URL } from '../../../config';
import Users from '../../../containers/Users';
import { getUsers } from '../../../db';
import { getRecords } from '../../../db/utils';
import { authPage } from '../../../middlewares';
import {
	ExtendedGetServerSideProps,
	GetUsersResponseType,
} from '../../../types';
import { Title } from '../../../utils';
import { serializeUserData } from '../../../utils/serializers';

const Page = ({
	data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<React.Fragment>
		<Title title="Users" />
		<Users users={data} />
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
			console.log('USERS PAGE :>> ', error);
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

	// Check is admin
	if (!req.user.isAdmin && !req.user.isSuperUser)
		return {
			props: {
				auth,
				errorPage: {
					statusCode: 403,
				},
			},
		};

	const result = await getRecords<GetUsersResponseType['data']>({
		model: 'users',
		perm: 'user',
		query: {
			limit: DEFAULT_PAGINATION_SIZE,
			offset: 0,
			search: '',
		},
		placeholder: {
			total: 0,
			result: [],
			active: 0,
			inactive: 0,
			on_leave: 0,
			employees: 0,
			clients: 0,
		},
		user: req.user,
		getData(params) {
			return getUsers(params);
		},
	});

	if (!result)
		return {
			props: {
				auth,
				errorPage: {
					statusCode: 403,
				},
			},
		};

	return {
		props: {
			auth,
			data: result.data,
		},
	};
};

export default Page;
