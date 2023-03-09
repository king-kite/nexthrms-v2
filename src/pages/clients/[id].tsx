import type { InferGetServerSidePropsType } from 'next';
import React from 'react';

import { permissions, LOGIN_PAGE_URL } from '../../config';
import ClientDetail from '../../containers/Clients/Detail';
import { getClient } from '../../db';
import { getUserObjectPermissions } from '../../db/utils';
import { authPage } from '../../middlewares';
import { ExtendedGetServerSideProps } from '../../types';
import { hasModelPermission, Title } from '../../utils';
import { serializeUserData } from '../../utils/serializers';

const Page = ({
	data,
	objPerm,
	objUserPerm,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<React.Fragment>
		<Title title="Client Information" />
		<ClientDetail client={data} objPerm={objPerm} objUserPerm={objUserPerm} />
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
			console.log('CLIENT PAGE :>> ', error);
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
		hasModelPermission(req.user.allPermissions, [permissions.client.VIEW]);

	// check if the user has a view object permission for this record
	const objPerm = await getUserObjectPermissions({
		modelName: 'clients',
		objectId: params?.id as string,
		userId: req.user.id,
	});
	if (objPerm.view === true) hasPerm = true;

	if (!hasPerm) {
		return {
			props: {
				auth,
				errorPage: {
					statusCode: 403,
				},
			},
		};
	}

	const data = await getClient(params?.id as string);

	if (!data) {
		return {
			notFound: true,
		};
	}

	const objUserPerm = await getUserObjectPermissions({
		modelName: 'users',
		objectId: data.contact.id as string, // contact represents user in the relation
		userId: req.user.id,
	});

	return {
		props: {
			auth,
			data: JSON.parse(JSON.stringify(data)),
			objPerm,
			objUserPerm,
		},
	};
};

export default Page;
