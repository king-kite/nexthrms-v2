import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

import { OVERTIME_URL } from '../../../config/services';
import Overtime from '../../../containers/overtime';
import Title from '../../../utils/components/title';
import { getServerSideData } from '../../../utils/server';

const Page = ({ data: overtime }: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title="My Overtime Requests" />
		<Overtime overtime={overtime?.data} />
	</>
);

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
	return await getServerSideData({
		req,
		res,
		url: OVERTIME_URL,
	});
};

export default Page;
