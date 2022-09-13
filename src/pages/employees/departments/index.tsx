import { InferGetServerSidePropsType } from 'next';
import React from 'react';
import { LOGIN_PAGE_URL } from '../../../config';

import Departments from '../../../containers/Departments';
import { getDepartments } from '../../../db';
import { authPage } from '../../../middlewares';
import { ExtendedGetServerSideProps } from '../../../types';
import { Title } from '../../../utils';
import { serializeUserData } from '../../../utils/serializers';

function Page({
	data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	return (
		<React.Fragment>
			<Title title="Departments" />
			<Departments departments={data} />
		</React.Fragment>
	);
}

export const getServerSideProps: ExtendedGetServerSideProps = async ({
	req,
	res,
}) => {
	try {
		await authPage().run(req, res);
	} catch (error) {
		if (process.env.NODE_ENV === 'development')
			console.log('DEPARTMENTS PAGE :>> ', error);
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
	const data = await getDepartments();

	return {
		props: {
			auth,
			data: JSON.parse(JSON.stringify(data)),
		},
	};
};

export default Page;
