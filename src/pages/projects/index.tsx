import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

import { PROJECTS_URL } from '../../config/services';
import Projects from '../../containers/projects';
import Title from '../../utils/components/title';
import { getServerSideData } from '../../utils/server';

const Page = ({ data: projects }: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title="Projects" />
		<Projects projects={projects?.data} />
	</>
);

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
	return await getServerSideData({
		req,
		res,
		url: PROJECTS_URL,
	});
};

export default Page;
