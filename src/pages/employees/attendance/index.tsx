import { InferGetServerSidePropsType } from 'next';
import Error from 'next/error';
import React from 'react';

import { LOGIN_PAGE_URL } from '../../../config';
import Attendance from '../../../containers/Attendance';
import { getAttendance, getAttendanceInfo } from '../../../db';
import { authPage } from '../../../middlewares';
import {
	ExtendedGetServerSideProps,
	GetAttendanceResponseType,
	GetAttendanceInfoResponseType,
} from '../../../types';
import { Title } from '../../../utils';
import { serializeUserData } from '../../../utils/serializers';

const Page = ({
	error,
	attendanceData,
	attendanceInfo,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<React.Fragment>
		{error ? (
			<Error statusCode={error.statusCode} title={error.title} />
		) : (
			<React.Fragment>
				<Title title="My Attendance" />
				<Attendance
					attendanceData={attendanceData}
					attendanceInfo={attendanceInfo}
				/>
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
	const attendanceData: GetAttendanceResponseType['data'] = JSON.parse(
		JSON.stringify(await getAttendance({ id: req.user.employee.id }))
	);
	const attendanceInfo: GetAttendanceInfoResponseType['data'] = JSON.parse(
		JSON.stringify(await getAttendanceInfo(req.user.employee.id))
	);

	return {
		props: { auth, attendanceData, attendanceInfo },
	};
};

export default Page;
