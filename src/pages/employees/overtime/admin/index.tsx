import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

import { OVERTIME_ADMIN_URL } from '../../../../config/services';
import Overtime from '../../../../containers/admin/overtime';
import Title from '../../../../utils/components/title';
import { getServerSideData } from '../../../../utils/server';

const Page = ({ data: overtime }: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title="Employees Overtime Requests" />
		<Overtime overtime={overtime?.data} />
	</>
);

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
	return await getServerSideData({
		req,
		res,
		url: OVERTIME_ADMIN_URL,
	});
};

export default Page;
