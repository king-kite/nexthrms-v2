import type { InferGetServerSidePropsType } from 'next';

import { LOGIN_PAGE_URL } from '../../../../config';
import TaskDetailPage from '../../../../containers/projects/detail/tasks/detail';
import { getProjectTask } from '../../../../db';
import { getRecord } from '../../../../db/utils';
import { authPage } from '../../../../middlewares';
import { ExtendedGetServerSideProps } from '../../../../types';
import { Title } from '../../../../utils';
import { serializeUserData } from '../../../../utils/serializers';
import { uuidSchema } from '../../../../validators';

const Page = ({
	objPerm,
	task,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title={task.name + ' Task Information'} />
		<TaskDetailPage task={task} objPerm={objPerm} />
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
			console.log('PROJECT TASK PAGE :>> ', error);
	}

	if (!req.user) {
		return {
			redirect: {
				destination: req.url
					? LOGIN_PAGE_URL + `?next=${req.url}`
					: LOGIN_PAGE_URL,
				permanent: false,
			},
		};
	}

	try {
		await uuidSchema.validateAsync(params?.id);
		await uuidSchema.validateAsync(params?.task_id);
	} catch (error) {
		return {
			notFound: true,
		};
	}

	const auth = await serializeUserData(req.user);

	const record = await getRecord({
		model: 'projects_tasks',
		perm: 'projecttask',
		objectId: params?.task_id as string,
		user: req.user,
		getData() {
			return getProjectTask(params?.task_id as string);
		},
	});

	if (!record)
		return {
			props: {
				auth,
				errorPage: { statusCode: 403 },
			},
		};

	if (!record.data)
		return {
			notFound: true,
		};

	return {
		props: {
			auth,
			objPerm: record.perm,
			task: record.data,
		},
	};
};

export default Page;
