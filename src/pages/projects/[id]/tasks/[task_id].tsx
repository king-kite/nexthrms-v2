import type { InferGetServerSidePropsType } from 'next';

import TaskDetailPage from '../../../../containers/projects/detail/tasks/detail';
import { getProjectTask } from '../../../../db/queries/projects';
import { getRecord } from '../../../../db/utils/record';
import { authPage } from '../../../../middlewares';
import { ExtendedGetServerSideProps } from '../../../../types';
import Title from '../../../../utils/components/title';
import { serializeUserData } from '../../../../utils/serializers/auth';
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
			props: {
				auth: null,
				errorPage: {
					statusCode: 401,
				},
			},
		};
	}

	try {
		await uuidSchema.validate(params?.id);
		await uuidSchema.validate(params?.task_id);
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
