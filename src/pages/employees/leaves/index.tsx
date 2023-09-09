import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

import { LEAVES_URL } from '../../../config/services';
import Leaves from '../../../containers/leaves';
import Title from '../../../utils/components/title';
import { getServerSideData } from '../../../utils/server';

const Page = ({ data: leaves }: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title="My Leave Requests" />
		<Leaves leaves={leaves?.data} />
	</>
);

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
	return await getServerSideData({
		req,
		res,
		url: LEAVES_URL,
	});
};

export default Page;
