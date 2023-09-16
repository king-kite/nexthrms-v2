import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

import { PROJECT_TASKS_URL } from '../../../../config/services';
import Tasks from '../../../../containers/projects/detail/tasks';
import Title from '../../../../utils/components/title';
import { getServerSideData } from '../../../../utils/server';

const Page = ({ data: tasks }: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title={tasks?.data?.project.name + ' Project Tasks'} />
		<Tasks tasks={tasks?.data} />
	</>
);

export const getServerSideProps: GetServerSideProps = async ({ req, res, params }) => {
	return await getServerSideData({
		req,
		res,
		url: PROJECT_TASKS_URL(params?.id as string),
	});
};

export default Page;
