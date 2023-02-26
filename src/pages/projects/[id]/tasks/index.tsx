import { InferGetServerSidePropsType } from 'next';
import { ParsedUrlQuery } from 'querystring';

import { LOGIN_PAGE_URL } from '../../../../config';
import { getProjectTasks } from '../../../../db';
import Tasks from '../../../../containers/Projects/Detail/Tasks';
import { authPage } from '../../../../middlewares';
import {
	ExtendedGetServerSideProps,
	GetProjectTasksResponseType,
} from '../../../../types';
import { Title } from '../../../../utils';
import { serializeUserData } from '../../../../utils/serializers';

const Page = ({
	tasks,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title={tasks.project.name + ' Project Tasks'} />
		<Tasks tasks={tasks} />
	</>
);

interface IParams extends ParsedUrlQuery {
	id: string;
}

export const getServerSideProps: ExtendedGetServerSideProps = async ({
	params,
	req,
	res,
}) => {
	const { id } = params as IParams;

	try {
		await authPage().run(req, res);
	} catch (error) {
		if (process.env.NODE_ENV === 'development')
			console.log('TASKS PAGE :>> ', error);
	}

	if (!req.user) {
		return {
			redirect: {
				destination: LOGIN_PAGE_URL,
				permanent: true,
			},
		};
	}

	const auth = await serializeUserData(req.user);
	const tasks: GetProjectTasksResponseType['data'] = JSON.parse(
		JSON.stringify(await getProjectTasks({ id }))
	);

	return {
		props: {
			auth,
			tasks,
		},
	};
};

export default Page;
