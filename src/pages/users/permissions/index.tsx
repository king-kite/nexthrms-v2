import type { InferGetServerSidePropsType } from 'next';
import Router from 'next/router';

import { DEFAULT_PAGINATION_SIZE, LOGIN_PAGE_URL } from '../../../config';
import Permissions from '../../../containers/users/permissions';
import { getPermissions } from '../../../db';
import { getRecords } from '../../../db/utils';
import { authPage } from '../../../middlewares';
import {
	ExtendedGetServerSideProps,
	GetPermissionsResponseType,
} from '../../../types';
import { Title } from '../../../utils';
import { serializeUserData } from '../../../utils/serializers';

const Page = ({
	data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title="Permissions" />
		<Permissions permissions={data} />
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
			console.log('PERMISSIONS PAGE :>> ', error);
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

	const result = await getRecords<GetPermissionsResponseType['data']>({
		model: 'permissions',
		perm: 'permission',
		query: {
			limit: DEFAULT_PAGINATION_SIZE,
			offset: 0,
			search: '',
		},
		placeholder: {
			total: 0,
			result: [],
		},
		user: req.user,
		getData(params) {
			return getPermissions(params);
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
