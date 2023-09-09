import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

import { LEAVES_ADMIN_URL } from '../../../../config/services';
import Leaves from '../../../../containers/admin/leaves';
import Title from '../../../../utils/components/title';
import { getServerSideData } from '../../../../utils/server';

const Page = ({ data: leaves }: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title="Employees Leave Requests" />
		<Leaves leaves={leaves?.data} />
	</>
);

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
	return await getServerSideData({
		req,
		res,
		url: LEAVES_ADMIN_URL,
	});
};

export default Page;
