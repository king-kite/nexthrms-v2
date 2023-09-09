import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

import { LEAVE_URL } from '../../../config/services';
import Leave from '../../../containers/leaves/detail';
import Title from '../../../utils/components/title';
import { getServerSideData } from '../../../utils/server';

const Page = ({ leave }: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title="My Leave Request" />
		<Leave leave={leave?.data} />
	</>
);

export const getServerSideProps: GetServerSideProps = async ({ req, res, params }) => {
	return await getServerSideData({
		req,
		res,
		url: LEAVE_URL(params?.id as string),
		paginate: false,
	});
};

export default Page;
