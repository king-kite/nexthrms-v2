import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

import { CLIENTS_URL } from '../../config/services';
import Clients from '../../containers/clients';
import Title from '../../utils/components/title';
import { getServerSideData } from '../../utils/server';

const Page = ({ data: clients }: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title="Clients" />
		<Clients clients={clients?.data} />
	</>
);

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
	return await getServerSideData({
		req,
		res,
		url: CLIENTS_URL,
	});
};

export default Page;
