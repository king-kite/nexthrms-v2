import { InferGetServerSidePropsType } from 'next';
import { ParsedUrlQuery } from 'querystring';

import { LOGIN_PAGE_URL } from '../../../config';
import Team from '../../../containers/Projects/Detail/Team';
import { getProject, getProjectTeam } from '../../../db';
import { authPage } from '../../../middlewares';
import {
	ExtendedGetServerSideProps,
	GetProjectTeamResponseType,
	ProjectType,
	SuccessResponseType,
} from '../../../types';
import { Title } from '../../../utils';

const Page = ({
	projectData,
	teamData,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title
			title={`Project Team - ${projectData.name} - Project Team Information`}
		/>
		<Team projectData={projectData} teamData={teamData} />
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
			console.log('PROJECT TEAM :>> ', error);
	}

	if (!req.user) {
		return {
			redirect: {
				destination: LOGIN_PAGE_URL,
				permanent: false,
			},
		};
	}

	const projectData: SuccessResponseType<ProjectType>['data'] = JSON.parse(
		JSON.stringify(await getProject(id))
	);
	const teamData: GetProjectTeamResponseType['data'] = JSON.parse(
		JSON.stringify(await getProjectTeam({ id }))
	);

	return {
		props: {
			auth: req.user,
			projectData,
			teamData,
		},
	};
};

export default Page;
