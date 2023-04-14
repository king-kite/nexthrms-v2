import type { InferGetServerSidePropsType } from 'next';

import {
	ATTENDANCE_PAGE_URL,
	DEFAULT_PAGINATION_SIZE,
	LOGIN_PAGE_URL,
} from '../../../config';
import Attendance from '../../../containers/attendance';
import { getAttendance, getAttendanceInfo } from '../../../db';
import { getRecords } from '../../../db/utils';
import { authPage } from '../../../middlewares';
import {
	ExtendedGetServerSideProps,
	GetAttendanceInfoResponseType,
} from '../../../types';
import { Title } from '../../../utils';
import { serializeUserData } from '../../../utils/serializers';

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
			redirect: {
				destination: LOGIN_PAGE_URL + `?next=${ATTENDANCE_PAGE_URL}`,
				permanent: false,
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
	const attendanceData = result ? result.data : placeholder;
	const attendanceInfo: GetAttendanceInfoResponseType['data'] = JSON.parse(
		JSON.stringify(await getAttendanceInfo(req.user.employee.id))
	);

	return {
		props: { auth, attendanceData, attendanceInfo },
	};
};

export default Page;
