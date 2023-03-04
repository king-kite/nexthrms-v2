import type { InferGetServerSidePropsType } from 'next';
import React from 'react';

import { permissions, LOGIN_PAGE_URL } from '../../../config';
import Employee from '../../../containers/Employees/Detail';
import { getEmployee } from '../../../db';
import { getUserObjectPermissions } from '../../../db/utils';
import { authPage } from '../../../middlewares';
import { ExtendedGetServerSideProps } from '../../../types';
import { hasModelPermission, Title } from '../../../utils';
import { serializeUserData } from '../../../utils/serializers';

const Page = ({
	data,
	objPerm,
	objUserPerm,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<React.Fragment>
		<Title title="Employee Information" />
		<Employee employee={data} objPerm={objPerm} objUserPerm={objUserPerm} />
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
			console.log('EMPLOYEE PAGE :>> ', error);
	}

	if (!req.user) {
		return {
			redirect: {
				destination: LOGIN_PAGE_URL,
				permanent: false,
			},
		};
	}

	let hasPerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [permissions.employee.VIEW]);

	// check if the user has a view object permission for this record
	const objPerm = await getUserObjectPermissions({
		modelName: 'employees',
		objectId: params?.id as string,
		userId: req.user.id,
	});
	if (objPerm.view === true) hasPerm = true;

	const auth = await serializeUserData(req.user);
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

	const data = await getEmployee(params?.id as string);

	if (!data) {
		return {
			notFound: true,
		};
	}

	const objUserPerm = await getUserObjectPermissions({
		modelName: 'users',
		objectId: data.user.id,
		userId: req.user.id,
		permission: 'EDIT',
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
