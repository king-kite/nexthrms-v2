import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

import { JOBS_URL } from '../../config/services';
import Jobs from '../../containers/jobs';
import Title from '../../utils/components/title';
import { getServerSideData } from '../../utils/server';

const Page = ({ data: jobs }: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title="Jobs" />
		<Jobs jobs={jobs?.data} />
	</>
);

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
	return await getServerSideData({
		req,
		res,
		url: JOBS_URL,
	});
};

export default Page;
