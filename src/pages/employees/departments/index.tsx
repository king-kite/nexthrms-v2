import type { InferGetServerSidePropsType } from 'next';

import {
	DEFAULT_PAGINATION_SIZE,
	DEPARTMENTS_PAGE_URL,
	LOGIN_PAGE_URL,
} from '../../../config';
import Departments from '../../../containers/departments';
import { getDepartments } from '../../../db';
import { getRecords } from '../../../db/utils';
import { authPage } from '../../../middlewares';
import { ExtendedGetServerSideProps } from '../../../types';
import { Title } from '../../../utils';
import { serializeUserData } from '../../../utils/serializers';

function Page({
	data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	return (
		<>
			<Title title="Departments" />
			<Departments departments={data} />
		</>
	);
}

export const getServerSideProps: ExtendedGetServerSideProps = async ({
	req,
	res,
}) => {
	try {
		await authPage().run(req, res);
	} catch (error) {
		if (process.env.NODE_ENV === 'development')
			console.log('DEPARTMENTS PAGE :>> ', error);
	}

	if (!req.user) {
		return {
			redirect: {
				destination: LOGIN_PAGE_URL + `?next=${DEPARTMENTS_PAGE_URL}`,
				permanent: false,
			},
		};
	}

	const auth = await serializeUserData(req.user);

	if (!req.user.isSuperUser && !req.user.isAdmin) {
		return {
			props: {
				auth,
				errorPage: { statusCode: 403 },
			},
		};
	}

	const result = await getRecords({
		model: 'departments',
		perm: 'department',
		placeholder: {
			total: 0,
			result: [],
		},
		query: {
			limit: DEFAULT_PAGINATION_SIZE,
			offset: 0,
			search: '',
		},
		user: req.user,
		getData(params) {
			return getDepartments(params);
		},
	});

	if (result)
		return {
			props: {
				auth,
				data: result.data,
			},
		};

	return {
		props: {
			auth,
			errorPage: { statusCode: 403 },
		},
	};
};

export default Page;
