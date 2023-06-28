import type { InferGetServerSidePropsType } from 'next';

import { DEFAULT_PAGINATION_SIZE } from '../../config/app';
import Jobs from '../../containers/jobs';
import { getJobs } from '../../db/queries/jobs';
import { getRecords } from '../../db/utils/record';
import { authPage } from '../../middlewares';
import { ExtendedGetServerSideProps } from '../../types';
import Title from '../../utils/components/title';
import { serializeUserData } from '../../utils/serializers/auth';

const Page = ({
	data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title="Jobs" />
		<Jobs jobs={data} />
	</>
);

export const getServerSideProps: ExtendedGetServerSideProps = async ({
	req,
	res,
}) => {
	try {
		await authPage().run(req, res);
	} catch (error) {
		if (process.env.NODE_ENV) console.log('JOBS PAGE ERROR:>> ', error);
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

	if (!req.user.isAdmin && !req.user.isSuperUser)
		return {
			props: {
				auth,
				errorPage: { statusCode: 403 },
			},
		};

	const result = await getRecords({
		model: 'jobs',
		perm: 'job',
		user: req.user,
		query: {
			limit: DEFAULT_PAGINATION_SIZE,
			offset: 0,
			search: '',
		},
		placeholder: {
			total: 0,
			result: [],
		},
		getData(params) {
			return getJobs(params);
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
