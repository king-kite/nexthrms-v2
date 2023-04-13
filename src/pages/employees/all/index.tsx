import type { InferGetServerSidePropsType } from 'next';

import { DEFAULT_PAGINATION_SIZE, LOGIN_PAGE_URL } from '../../../config';
import Employees from '../../../containers/employees';
import { getEmployees } from '../../../db';
import { getRecords } from '../../../db/utils';
import { authPage } from '../../../middlewares';
import { ExtendedGetServerSideProps } from '../../../types';
import { Title } from '../../../utils';
import { serializeUserData } from '../../../utils/serializers';

const Page = ({
	data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title="Employees" />
		<Employees employees={data} />
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
			console.log('EMPLOYEES PAGE :>> ', error);
	}

	if (!req.user) {
		return {
			redirect: {
				destination: req.url
					? LOGIN_PAGE_URL + `?next=${req.url}`
					: LOGIN_PAGE_URL,
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

	const result = await getRecords({
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
