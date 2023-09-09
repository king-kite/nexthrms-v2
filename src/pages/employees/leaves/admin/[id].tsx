import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

import { LEAVE_ADMIN_URL } from '../../../../config/services';
import Leave from '../../../../containers/leaves/detail';
import Title from '../../../../utils/components/title';
import { getServerSideData } from '../../../../utils/server';

const Page = ({ data: leave }: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title="Employee Leave Request" />
		<Leave admin leave={leave?.data} />
	</>
);

export const getServerSideProps: GetServerSideProps = async ({ req, res, params }) => {
	return await getServerSideData({
		req,
		res,
		url: LEAVE_ADMIN_URL(params?.id as string),
		paginate: false,
	});
};

export default Page;
