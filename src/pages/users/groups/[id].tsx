import type { InferGetServerSidePropsType } from 'next';
import React from 'react';

import {
	permissions,
	DEFAULT_PAGINATION_SIZE,
	LOGIN_PAGE_URL,
} from '../../../config';
import Group from '../../../containers/Users/Groups/Detail';
import { getGroup } from '../../../db';
import { getUserObjectPermissions } from '../../../db/utils';
import { authPage } from '../../../middlewares';
import { ExtendedGetServerSideProps, GroupType } from '../../../types';
import { hasModelPermission, Title } from '../../../utils';
import { serializeUserData } from '../../../utils/serializers';

const Page = ({
	data,
	objPerm,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<React.Fragment>
		<Title title="Group Information" />
		<Group group={data} objPerm={objPerm} />
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
			console.log('GROUP PAGE :>> ', error);
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
	// check is admin
	if (!req.user.isSuperUser && !req.user.isAdmin)
		return {
			props: {
				auth,
				errorPage: { statusCode: 403 },
			},
		};

	let hasPerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [permissions.group.VIEW]);

	// check if the user has a view object permission for this record
	const objPerm = await getUserObjectPermissions({
		modelName: 'groups',
		objectId: params?.id as string,
		userId: req.user.id,
	});
	if (objPerm.view === true) hasPerm = true;

	if (!hasPerm)
		return {
			props: {
				auth,
				errorPage: {
					statusCode: 403,
				},
			},
		};

	const data = await getGroup(params?.id as string, {
		user: {
			limit: DEFAULT_PAGINATION_SIZE,
			offset: 0,
			search: '',
		},
	});

	if (!data) {
		return {
			notFound: true,
		};
	}

	return {
		props: {
			auth,
			objPerm,
			data: JSON.parse(JSON.stringify(data)),
		},
	};
};

export default Page;
