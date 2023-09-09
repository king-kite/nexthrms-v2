import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

import { HOLIDAYS_URL } from '../../config/services';
import Holidays from '../../containers/holiday';
import Title from '../../utils/components/title';
import { getServerSideData } from '../../utils/server';

const Page = ({ data: holidays }: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title="Holidays" />
		<Holidays holidays={holidays?.data} />
	</>
);

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
	return await getServerSideData({
		req,
		res,
		url: HOLIDAYS_URL,
	});
};

export default Page;
