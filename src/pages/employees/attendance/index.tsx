import { InferGetServerSidePropsType } from 'next';
import Error from 'next/error';
import React from 'react';

import { LOGIN_PAGE_URL } from '../../../config';
import Attendance from '../../../containers/Attendance';
import { authPage } from '../../../middlewares';
import { ExtendedGetServerSideProps } from '../../../types';
import { Title } from '../../../utils';
import { serializeUserData } from '../../../utils/serializers';

const Page = ({
	error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<React.Fragment>
		{error ? (
			<Error statusCode={error.statusCode} title={error.title} />
		) : (
			<React.Fragment>
				<Title title="My Attendance" />
				<Attendance />
			</React.Fragment>
		)}
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
			console.log('ATTENDANCE ERROR :>>', error);
	}

	if (!req.user) {
		return {
			redirect: {
				destination: LOGIN_PAGE_URL,
				permanent: false,
			},
		};
	}

	if (!req.user.employee) {
		return {
			props: {
				error: {
					statusCode: 403,
					title: 'Only employees can view this page!',
				},
			},
		};
	}

	const auth = serializeUserData(req.user);

	return {
		props: { auth },
	};
};

export default Page;
