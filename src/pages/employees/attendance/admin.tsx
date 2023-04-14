import type { InferGetServerSidePropsType } from 'next';

import {
	ATTENDANCE_ADMIN_PAGE_URL,
	DEFAULT_PAGINATION_SIZE,
	LOGIN_PAGE_URL,
} from '../../../config';
import Attendance from '../../../containers/attendance/admin';
import { getAttendanceAdmin } from '../../../db';
import { getRecords } from '../../../db/utils';
import { authPage } from '../../../middlewares';
import { ExtendedGetServerSideProps } from '../../../types';
import { Title } from '../../../utils';
import { serializeUserData } from '../../../utils/serializers';

function Page({
	attendance,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	return (
		<>
			<Title title="Attendance (Admin)" />
			<Attendance attendance={attendance} />
		</>
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
				destination: LOGIN_PAGE_URL + `?next=${ATTENDANCE_ADMIN_PAGE_URL}`,
				permanent: false,
			},
		};
	}

	const auth = await serializeUserData(req.user);
	if (!req.user.isAdmin && !req.user.isSuperUser) {
		return {
			props: {
				auth,
				error: { statusCode: 403 },
			},
		};
	}

	const result = await getRecords({
		model: 'attendance',
		perm: 'attendance',
		user: req.user,
		query: {
			limit: DEFAULT_PAGINATION_SIZE,
			offset: 0,
			search: '',
		},
		placeholder: {
			result: [],
			total: 0,
		},
		getData(params) {
			return getAttendanceAdmin(params);
		},
	});

	if (result)
		return {
			props: {
				auth,
				attendance: result.data,
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
