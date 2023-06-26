import { InferGetServerSidePropsType } from 'next';

import Project from '../../../containers/projects/detail';
import { getProject, getProjectFiles } from '../../../db';
import { getRecord, getRecords } from '../../../db/utils';
import { authPage } from '../../../middlewares';
import { ExtendedGetServerSideProps } from '../../../types';
import { Title } from '../../../utils';
import { serializeUserData } from '../../../utils/serializers';
import { uuidSchema } from '../../../validators';

function Page({
	objPerm,
	project,
	projectFiles,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	return (
		<>
			<Title title={`${project.name} - Project Information`} />
			<Project
				objPerm={objPerm}
				project={project}
				projectFiles={projectFiles}
			/>
		</>
	);
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
			console.log('PROJECT ERROR :<< ', error);
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

	const auth = await serializeUserData(req.user);

	try {
		await uuidSchema.validate(params?.id);
	} catch (error) {
		return {
			notFound: true,
		};
	}

	const record = await getRecord({
		model: 'projects',
		perm: 'project',
		objectId: params?.id as string,
		user: req.user,
		getData() {
			return getProject(params?.id as string);
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

	const projectFiles = await getRecords({
		model: 'projects_files',
		perm: 'projectfile',
		user: req.user,
		query: {},
		placeholder: {
			result: [],
		},
		getData(queryParams) {
			return getProjectFiles({
				...queryParams,
				id: params?.id as string,
			});
		},
	});

	return {
		props: {
			auth,
			objPerm: record.perm,
			project: record.data,
			projectFiles: projectFiles
				? projectFiles.data
				: {
						result: [],
				  },
		},
	};
};

export default Page;
