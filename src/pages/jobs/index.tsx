import type { InferGetServerSidePropsType } from 'next';

import {
	DEFAULT_PAGINATION_SIZE,
	LOGIN_PAGE_URL,
	JOBS_PAGE_URL,
} from '../../config';
import Jobs from '../../containers/jobs';
import { getJobs } from '../../db';
import { getRecords } from '../../db/utils';
import { authPage } from '../../middlewares';
import { ExtendedGetServerSideProps } from '../../types';
import { Title } from '../../utils';
import { serializeUserData } from '../../utils/serializers';

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
			redirect: {
				destination: LOGIN_PAGE_URL + `?next=${JOBS_PAGE_URL}`,
				permanent: false,
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
