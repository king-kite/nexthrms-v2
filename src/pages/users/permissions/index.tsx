import type { InferGetServerSidePropsType } from 'next';
import React from 'react';

import {
	permissions,
	DEFAULT_PAGINATION_SIZE,
	LOGIN_PAGE_URL,
} from '../../../config';
import Permissions from '../../../containers/Users/Permissions';
import { getPermissions } from '../../../db';
import { getUserObjects } from '../../../db/utils';
import { authPage } from '../../../middlewares';
import { ExtendedGetServerSideProps } from '../../../types';
import { hasModelPermission, Title } from '../../../utils';
import { serializeUserData } from '../../../utils/serializers';

const Page = ({
	data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => (
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

	const hasViewPerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [permissions.permission.VIEW]);

	if (hasViewPerm) {
		const data = await getPermissions({
			limit: DEFAULT_PAGINATION_SIZE,
			offset: 0,
			search: '',
		});

		return {
			props: {
				auth,
				data: JSON.parse(JSON.stringify(data)),
			},
		};
	}

	// Since the user is not a super user and doe not have model permissions
	// check if the user has a view object permission for any record in this table
	const records = await getUserObjects({
		modelName: 'permissions',
		permission: 'VIEW',
		userId: req.user.id,
	});
	if (records.length > 0) {
		const data = await getPermissions({
			limit: DEFAULT_PAGINATION_SIZE,
			offset: 0,
			search: '',
			where: {
				id: {
					in: records.map((obj) => obj.objectId),
				},
			},
		});
		if (data.total > 0) {
			return {
				props: {
					auth,
					data: JSON.parse(JSON.stringify(data)),
				},
			};
		}
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
