import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

import { ATTENDANCE_ADMIN_URL } from '../../../config/services';
import Attendance from '../../../containers/attendance/admin';
import Title from '../../../utils/components/title';
import { getServerSideData } from '../../../utils/server';

function Page({ data: attendance }: InferGetServerSidePropsType<typeof getServerSideProps>) {
	return (
		<>
			<Title title="Attendance (Admin)" />
			<Attendance attendance={attendance?.data} />
		</>
	);
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
	return await getServerSideData({
		req,
		res,
		url: ATTENDANCE_ADMIN_URL,
	});
};

export default Page;
