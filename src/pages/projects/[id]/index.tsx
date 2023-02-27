import { InferGetServerSidePropsType } from 'next';
import { ParsedUrlQuery } from 'querystring';

import { LOGIN_PAGE_URL } from '../../../config';
import Project from '../../../containers/Projects/Detail';
import { getProject, getProjectFiles } from '../../../db';
import { authPage } from '../../../middlewares';
import {
	ExtendedGetServerSideProps,
	GetProjectFilesResponseType,
	ProjectType,
	SuccessResponseType,
} from '../../../types';
import { Title } from '../../../utils';
import { serializeUserData } from '../../../utils/serializers';

function Page({
	project,
	projectFiles,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	return (
		<>
			<Title title={`${project.name} - Project Information`} />
			<Project project={project} projectFiles={projectFiles} />
		</>
	);
}

interface IParams extends ParsedUrlQuery {
	id: string;
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
			redirect: {
				destination: LOGIN_PAGE_URL,
				permanent: false,
			},
		};
	}

	const { id } = params as IParams;

	const auth = await serializeUserData(req.user);
	const project: SuccessResponseType<ProjectType> = JSON.parse(
		JSON.stringify(await getProject(id))
	);
	const projectFiles: GetProjectFilesResponseType['data'] = JSON.parse(
		JSON.stringify(await getProjectFiles({ id }))
	);

	return {
		props: {
			auth,
			project,
			projectFiles,
		},
	};
};

export default Page;
