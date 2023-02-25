import { InferGetServerSidePropsType } from 'next';
import React from 'react';

import { models, permissions, LOGIN_PAGE_URL } from '../../../../../config';
import ObjectPermissions from '../../../../../containers/Users/Permissions/Objects';
import { getObjectPermissions } from '../../../../../db';
import { authPage } from '../../../../../middlewares';
import {
	ExtendedGetServerSideProps,
	PermissionModelNameType,
} from '../../../../../types';
import { hasModelPermission, Title } from '../../../../../utils';
import { serializeUserData } from '../../../../../utils/serializers';

const Page = ({
	data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<React.Fragment>
		<Title title="Record Permissions" />
		<ObjectPermissions permissions={data} />
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

	const hasPerm =
		req.user.isSuperUser ||
		(req.user.isAdmin &&
			hasModelPermission(req.user.allPermissions, [
				permissions.permissionobject.VIEW,
			]));

	// User doesn't have permission, redirect to 403 page
	if (!hasPerm) {
		return {
			props: {
				errorPage: {
					statusCode: 403,
					title: 'You are not authorized to view this page!',
				},
			},
		};
	}

	const modelName = params?.model as PermissionModelNameType;
	const objectId = params?.objectId as string;

	if (!models.includes(modelName))
		return {
			notFound: true,
		};

	const auth = serializeUserData(req.user);
	const data = await getObjectPermissions(modelName, objectId);

	return {
		props: {
			auth,
			data: JSON.parse(JSON.stringify(data)),
		},
	};
};

export default Page;
