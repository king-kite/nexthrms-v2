import { InferGetServerSidePropsType } from 'next';
import Error from 'next/error';
import React from 'react';

import { LOGIN_PAGE_URL } from '../../../config';
import Attendance from '../../../containers/Attendance/Admin';
import { getAttendanceAdmin } from '../../../db';
import { authPage } from '../../../middlewares';
import {
	ExtendedGetServerSideProps,
	GetAttendanceResponseType,
} from '../../../types';
import { Title } from '../../../utils';
import { serializeUserData } from '../../../utils/serializers';

function Page({
	error,
	attendance,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	return (
		<React.Fragment>
			{error ? (
				<Error statusCode={error.statusCode} title={error.title} />
			) : (
				<React.Fragment>
					<Title title="Attendance (Admin)" />
					<Attendance attendance={attendance} />
				</React.Fragment>
			)}
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

	const auth = await serializeUserData(req.user);
	const attendance: GetAttendanceResponseType['data'] = JSON.parse(
		JSON.stringify(await getAttendanceAdmin())
	);

	return {
		props: { auth, attendance },
	};
};

export default Page;
