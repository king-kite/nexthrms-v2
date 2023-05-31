import { PermissionModelChoices } from '@prisma/client';
import { InferGetServerSidePropsType } from 'next';

import { models, permissions } from '../../../../../config';
import ObjectPermissions from '../../../../../containers/users/permissions/objects';
import { getObjectPermissions } from '../../../../../db';
import { authPage } from '../../../../../middlewares';
import { ExtendedGetServerSideProps } from '../../../../../types';
import { hasModelPermission, Title } from '../../../../../utils';
import { serializeUserData } from '../../../../../utils/serializers';
import { uuidSchema } from '../../../../../validators';

const Page = ({
	data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title="Record Permissions" />
		<ObjectPermissions permissions={data} />
	</>
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
			props: {
				auth: null,
				errorPage: {
					statusCode: 401,
				},
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

	try {
		await uuidSchema.validateAsync(params?.objectId);
	} catch (error) {
		return {
			notFound: true,
		};
	}

	const modelName = params?.model as PermissionModelChoices;
	const objectId = params?.objectId as string;

	if (!models.includes(modelName))
		return {
			notFound: true,
		};

	const auth = await serializeUserData(req.user);
	const data = await getObjectPermissions(modelName, objectId);

	return {
		props: {
			auth,
			data: JSON.parse(JSON.stringify(data)),
		},
	};
};

export default Page;
