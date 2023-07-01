import type { InferGetServerSidePropsType } from 'next';

import { DEFAULT_PAGINATION_SIZE } from '../../../config/app';
import Attendance from '../../../containers/attendance';
import {
	getAttendance,
	getAttendanceInfo,
} from '../../../db/queries/attendance';
import { getRecords } from '../../../db/utils/record';
import { authPage } from '../../../middlewares';
import {
	ExtendedGetServerSideProps,
	GetAttendanceInfoResponseType,
} from '../../../types';
import Title from '../../../utils/components/title';
import { getStringedDate } from '../../../utils/dates';
import { serializeUserData } from '../../../utils/serializers/auth';

const Page = ({
	attendanceData,
	attendanceInfo,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title="My Attendance" />
		<Attendance
			attendanceData={attendanceData}
			attendanceInfo={attendanceInfo}
		/>
	</>
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
			props: {
				auth: null,
				errorPage: {
					statusCode: 401,
				},
			},
		};
	}

	const auth = await serializeUserData(req.user);
	if (!req.user.employee) {
		return {
			props: {
				auth,
				errorPage: {
					statusCode: 403,
					title: 'Sorry, this paage is reserved for employees only.',
				},
			},
		};
	}

	const placeholder = {
		total: 0,
		result: [],
	};
	const result = await getRecords({
		model: 'attendance',
		perm: 'attendance',
		placeholder,
		user: req.user,
		query: {
			limit: DEFAULT_PAGINATION_SIZE,
			offset: 0,
		},
		getData(params) {
			return getAttendance({
				...params,
				id: req.user?.employee?.id || '',
			});
		},
	});
	const date = getStringedDate();
	const attendanceData = result ? result.data : placeholder;
	const attendanceInfo: GetAttendanceInfoResponseType['data'] = JSON.parse(
		JSON.stringify(await getAttendanceInfo(req.user.employee.id, date))
	);

	return {
		props: { auth, attendanceData, attendanceInfo },
	};
};

export default Page;
