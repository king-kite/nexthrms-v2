import { InferGetServerSidePropsType } from 'next';
import { ParsedUrlQuery } from 'querystring';

import { LOGIN_PAGE_URL } from '../../../../config';
import TaskDetailPage from '../../../../containers/Projects/Detail/Tasks/Detail';
import { getProjectTask } from '../../../../db';
import { authPage } from '../../../../middlewares';
import { ExtendedGetServerSideProps, ProjectTaskType } from '../../../../types';
import { Title } from '../../../../utils';
import { serializeUserData } from '../../../../utils/serializers';

const Page = ({
	task,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title={task.name + ' Project Task'} />
		<TaskDetailPage task={task} />
	</>
);

interface IParams extends ParsedUrlQuery {
	id: string;
	task_id: string;
}

export const getServerSideProps: ExtendedGetServerSideProps = async ({
	params,
	req,
	res,
}) => {
	try {
		await authPage().run(req, res);
	} catch (error) {
		if (process.env.NODE_ENV === 'development')
			console.log('PROJECT TASK PAGE :>> ', error);
	}

	if (!req.user) {
		return {
			redirect: {
				destination: LOGIN_PAGE_URL,
				permanent: false,
			},
		};
	}

	const { task_id } = params as IParams;

	const auth = serializeUserData(req.user);
	const task: ProjectTaskType = JSON.parse(
		JSON.stringify(await getProjectTask(task_id))
	);

	return {
		props: {
			auth,
			task,
		},
	};
};

export default Page;
