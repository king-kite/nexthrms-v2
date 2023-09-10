import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

import { PROJECT_TEAM_URL } from '../../../config/services';
import Team from '../../../containers/projects/detail/team';
import Title from '../../../utils/components/title';
import { getServerSideData } from '../../../utils/server';

const Page = ({ data: project }: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title={`Project Team - ${project.name} - Project Team Information`} />
		<Team projectData={project?.data} />
	</>
);

export const getServerSideProps: GetServerSideProps = async ({ req, res, params }) => {
	return await getServerSideData({
		req,
		res,
		url: PROJECT_TEAM_URL(params?.id as string),
	});
};

export default Page;
