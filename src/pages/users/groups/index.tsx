import type { InferGetServerSidePropsType } from 'next';
import Router from 'next/router';

import { DEFAULT_PAGINATION_SIZE, LOGIN_PAGE_URL } from '../../../config';
import Groups from '../../../containers/users/groups';
import { getGroups } from '../../../db';
import { getRecords } from '../../../db/utils';
import { authPage } from '../../../middlewares';
import {
	ExtendedGetServerSideProps,
	GetGroupsResponseType,
} from '../../../types';
import { Title } from '../../../utils';
import { serializeUserData } from '../../../utils/serializers';

const Page = ({
	data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title="Groups" />
		<Groups groups={data} />
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
			console.log('GROUPS PAGE :>> ', error);
	}

	if (!req.user) {
		return {
			redirect: {
				destination: LOGIN_PAGE_URL + `?next=${Router.asPath}`,
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

	const params = {
		limit: DEFAULT_PAGINATION_SIZE,
		offset: 0,
		search: '',
		users: {
			limit: DEFAULT_PAGINATION_SIZE,
			offset: 0,
			search: '',
		},
	};

	const result = await getRecords<GetGroupsResponseType['data']>({
		model: 'groups',
		perm: 'group',
		placeholder: {
			total: 0,
			result: [],
		},
		query: params,
		user: req.user,
		getData(recordParams) {
			return getGroups({
				...recordParams,
				...params,
			});
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
