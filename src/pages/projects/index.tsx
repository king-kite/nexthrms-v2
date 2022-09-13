import { InferGetServerSidePropsType } from 'next';
import React from 'react';

import { LOGIN_PAGE_URL } from '../../config';
import Projects from '../../containers/Projects';
import { getProjects } from '../../db';
import { authPage } from '../../middlewares';
import {
	ExtendedGetServerSideProps,
	GetProjectsResponseType,
} from '../../types';
import { Title } from '../../utils';
import { serializeUserData } from '../../utils/serializers';

const Page = ({
	projects,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<React.Fragment>
		<Title title="Projects" />
		<Projects projects={projects} />
	</React.Fragment>
);

export const getServerSideProps: ExtendedGetServerSideProps = async ({
	req,
	res,
}) => {
	try {
		await authPage().run(req, res);
	} catch (error) {
		if (process.env.NODE_ENV === 'development')
			console.log('PROJECTS PAGE ERROR :>> ', error);
	}

	if (!req.user) {
		return {
			redirect: {
				destination: LOGIN_PAGE_URL,
				permanent: false,
			},
		};
	}

	const auth = serializeUserData(req.user);
	const projects: GetProjectsResponseType['data'] = JSON.parse(
		JSON.stringify(await getProjects())
	);

	return {
		props: {
			auth,
			projects,
		},
	};
};

export default Page;
