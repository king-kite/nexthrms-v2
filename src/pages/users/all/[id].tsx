import type { InferGetServerSidePropsType } from 'next';
import React from 'react';

import {
	permissions,
	DEFAULT_PAGINATION_SIZE,
	LOGIN_PAGE_URL,
} from '../../../config';
import User from '../../../containers/Users/Detail';
import { getUser, getUserGroups, getUserPermissions } from '../../../db';
import { getUserObjectPermissions } from '../../../db/utils';
import { authPage } from '../../../middlewares';
import { ExtendedGetServerSideProps } from '../../../types';
import { hasModelPermission, Title } from '../../../utils';
import { serializeUserData } from '../../../utils/serializers';

const Page = ({
	data,
	objPerm,
	objClientPerm,
	objEmployeePerm,
	groups,
	permissions,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<React.Fragment>
		<Title title="User Information" />
		<User
			groups={groups}
			objPerm={objPerm}
			objClientPerm={objClientPerm}
			objEmployeePerm={objEmployeePerm}
			permissions={permissions}
			user={data}
		/>
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

	let hasPerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [permissions.user.VIEW]);

	// check if the user has a view object permission for this record
	const objPerm = await getUserObjectPermissions({
		modelName: 'users',
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

	const data = await getUser(params?.id as string);
	const groups = await getUserGroups(params?.id as string, {
		limit: DEFAULT_PAGINATION_SIZE,
		offset: 0,
		search: '',
	});
	const perms = await getUserPermissions(params?.id as string, {
		limit: DEFAULT_PAGINATION_SIZE,
		offset: 0,
		search: '',
	});

	if (!data) {
		return {
			notFound: true,
		};
	}

	// check if the user has a view object permission for this user's client record
	const objClientPerm = data.client
		? await getUserObjectPermissions({
				modelName: 'clients',
				objectId: data.client.id,
				userId: req.user.id,
				permission: 'VIEW',
		  })
		: null;

	// check if the user has a view object permission for this user's employee record
	const objEmployeePerm = data.employee
		? await getUserObjectPermissions({
				modelName: 'employees',
				objectId: data.employee.id,
				userId: req.user.id,
				permission: 'VIEW',
		  })
		: null;

	const props = {
		auth,
		objPerm,
		data: JSON.parse(JSON.stringify(data)),
		groups: JSON.parse(JSON.stringify(groups)),
		permissions: JSON.parse(JSON.stringify(perms)),
	};

	if (objClientPerm) Object(props).objClientPerm = objClientPerm;
	if (objEmployeePerm) Object(props).objEmployeePerm = objEmployeePerm;

	return { props };
};

export default Page;
