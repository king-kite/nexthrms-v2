import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

import { PROJECT_TASK_URL } from '../../../../config/services';
import TaskDetailPage from '../../../../containers/projects/detail/tasks/detail';
import Title from '../../../../utils/components/title';
import { getServerSideData } from '../../../../utils/server';

const Page = ({ data: task }: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title={task.name + ' Task Information'} />
		<TaskDetailPage task={task?.data} />
	</>
);

export const getServerSideProps: GetServerSideProps = async ({ req, res, params }) => {
	return await getServerSideData({
		req,
		res,
		url: PROJECT_TASK_URL(params?.id as string, params?.task_id as string),
	});
};

export default Page;
