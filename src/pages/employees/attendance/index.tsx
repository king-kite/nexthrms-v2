import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

import { ATTENDANCE_URL } from '../../../config/services';
import Attendance from '../../../containers/attendance';
import Title from '../../../utils/components/title';
import { getServerSideData } from '../../../utils/server';

const Page = ({ data: attendance }: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title="My Attendance" />
		<Attendance attendanceData={attendance?.data} />
	</>
);

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
	return await getServerSideData({
		req,
		res,
		url: ATTENDANCE_URL,
	});
};

export default Page;
