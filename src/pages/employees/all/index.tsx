import type { InferGetServerSidePropsType } from 'next';
import React from 'react';

import { DEFAULT_PAGINATION_SIZE, LOGIN_PAGE_URL } from '../../../config';
import Employees from '../../../containers/Employees';
import { getEmployees } from '../../../db';
import { getRecords } from '../../../db/utils';
import { authPage } from '../../../middlewares';
import {
	ExtendedGetServerSideProps,
	GetEmployeesResponseType,
} from '../../../types';
import { hasModelPermission, Title } from '../../../utils';
import { serializeUserData } from '../../../utils/serializers';

const Page = ({
	data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<React.Fragment>
		<Title title="Employees" />
		<Employees employees={data} />
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
			console.log('EMPLOYEES PAGE :>> ', error);
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

	const result = await getRecords<GetEmployeesResponseType['data']>({
		model: 'employees',
		perm: 'employee',
		query: {
			limit: DEFAULT_PAGINATION_SIZE,
			offset: 0,
			search: '',
		},
		user: req.user,
		placeholder: {
			total: 0,
			inactive: 0,
			on_leave: 0,
			active: 0,
			result: [],
		},
		getData(params) {
			return getEmployees(params);
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
