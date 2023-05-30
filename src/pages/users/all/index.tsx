import type { InferGetServerSidePropsType } from 'next';

import { DEFAULT_PAGINATION_SIZE } from '../../../config';
import Users from '../../../containers/users';
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
	<>
		<Title title="Users" />
		<Users users={data} />
	</>
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
			props: {
				auth: undefined,
				errorPage: {
					statusCode: 401,
				},
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
