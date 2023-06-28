import type { InferGetServerSidePropsType } from 'next';

import { DEFAULT_PAGINATION_SIZE } from '../../../config/app';
import Departments from '../../../containers/departments';
import { getDepartments } from '../../../db/queries/departments';
import { getRecords } from '../../../db/utils/record';
import { authPage } from '../../../middlewares';
import { ExtendedGetServerSideProps } from '../../../types';
import Title from '../../../utils/components/title';
import { serializeUserData } from '../../../utils/serializers/auth';

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
			props: {
				auth: null,
				errorPage: {
					statusCode: 401,
				},
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
