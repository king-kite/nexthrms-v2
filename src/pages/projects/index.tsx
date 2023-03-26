import { InferGetServerSidePropsType } from 'next';
import React from 'react';

import { DEFAULT_PAGINATION_SIZE, LOGIN_PAGE_URL } from '../../config';
import Projects from '../../containers/Projects';
import { getProjects } from '../../db';
import { getRecords } from '../../db/utils';
import { authPage } from '../../middlewares';
import { ExtendedGetServerSideProps } from '../../types';
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

	const auth = await serializeUserData(req.user);

	const result = await getRecords({
		model: 'projects',
		perm: 'project',
		user: req.user,
		query: {
			limit: DEFAULT_PAGINATION_SIZE,
			offset: 0,
			search: '',
		},
		placeholder: {
			total: 0,
			result: [],
			completed: 0,
			ongoing: 0,
		},
		getData(params) {
			return getProjects(params);
		},
	});

	if (result)
		return {
			props: {
				auth,
				projects: result.data,
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
