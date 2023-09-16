import { GetServerSideProps, InferGetServerSidePropsType } from 'next';

import { PROJECT_URL } from '../../../config/services';
import Project from '../../../containers/projects/detail';
import Title from '../../../utils/components/title';
import { getServerSideData } from '../../../utils/server';

function Page({ data: project }: InferGetServerSidePropsType<typeof getServerSideProps>) {
	return (
		<>
			<Title title={`${project?.data?.name} - Project Information`} />
			<Project project={project?.data} />
		</>
	);
}

export const getServerSideProps: GetServerSideProps = async ({ req, res, params }) => {
	return await getServerSideData({
		req,
		res,
		url: PROJECT_URL(params?.id as string),
		paginate: false,
	});
};

export default Page;
