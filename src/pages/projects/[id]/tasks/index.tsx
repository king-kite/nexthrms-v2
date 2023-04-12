import type { InferGetServerSidePropsType } from 'next';
import Router from 'next/router';

import { DEFAULT_PAGINATION_SIZE, LOGIN_PAGE_URL } from '../../../../config';
import Tasks from '../../../../containers/projects/detail/tasks';
import { getProjectTasks } from '../../../../db';
import { getRecords, hasViewPermission } from '../../../../db/utils';
import { authPage } from '../../../../middlewares';
import { ExtendedGetServerSideProps } from '../../../../types';
import { Title } from '../../../../utils';
import { serializeUserData } from '../../../../utils/serializers';
import { uuidSchema } from '../../../../validators';

const Page = ({
	tasks,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title={tasks.project.name + ' Project Tasks'} />
		<Tasks tasks={tasks} />
	</>
);

export const getServerSideProps: ExtendedGetServerSideProps = async ({
	params,
	req,
	res,
}) => {
	try {
		await authPage().run(req, res);
	} catch (error) {
		if (process.env.NODE_ENV === 'development')
			console.log('TASKS PAGE :>> ', error);
	}

	if (!req.user) {
		return {
			redirect: {
				destination: LOGIN_PAGE_URL + `?next=${Router.asPath}`,
				permanent: true,
			},
		};
	}

	try {
		await uuidSchema.validateAsync(params?.id);
	} catch (error) {
		return {
			notFound: true,
		};
	}

	const auth = await serializeUserData(req.user);
	const placeholder = {
		result: [],
		total: 0,
		completed: 0,
		ongoing: 0,
		project: {
			id: params?.id as string,
			name: '',
		},
	};

	const result = await getRecords({
		model: 'projects_tasks',
		perm: 'projecttask',
		user: req.user,
		query: {
			limit: DEFAULT_PAGINATION_SIZE,
			offset: 0,
			search: '',
		},
		placeholder,
		getData(queryParams) {
			return getProjectTasks({
				...queryParams,
				id: params?.id as string,
			});
		},
	});

	if (result)
		return {
			props: {
				auth,
				tasks: result.data,
			},
		};
	const canViewProject = await hasViewPermission({
		model: 'projects',
		perm: 'project',
		objectId: params?.id as string,
		user: req.user,
	});

	if (canViewProject)
		return {
			props: {
				auth,
				tasks: placeholder,
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
