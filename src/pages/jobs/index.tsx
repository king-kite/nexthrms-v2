import { InferGetServerSidePropsType } from 'next';
import React from 'react';
import { LOGIN_PAGE_URL } from '../../config';

import Jobs from '../../containers/Jobs';
import { getJobs } from '../../db';
import { authPage } from '../../middlewares';
import { ExtendedGetServerSideProps } from '../../types';
import { Title } from '../../utils';
import { serializeUserData } from '../../utils/serializers';

const Page = ({
	jobs,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<React.Fragment>
		<Title title="Jobs" />
		<Jobs jobs={jobs} />
	</React.Fragment>
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
				destination: LOGIN_PAGE_URL,
				permanent: false,
			},
		};
	}

	const auth = await serializeUserData(req.user);
	const jobs = await getJobs();

	return {
		props: {
			auth,
			jobs,
		},
	};
};

export default Page;
