import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

import { CLIENT_URL } from '../../config/services';
import ClientDetail from '../../containers/clients/detail';
import Title from '../../utils/components/title';
import { getServerSideData } from '../../utils/server';

const Page = ({ data: client }: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title="Client Information" />
		<ClientDetail client={client?.data} />
	</>
);

export const getServerSideProps: GetServerSideProps = async ({ req, res, params }) => {
	return await getServerSideData({
		req,
		res,
		url: CLIENT_URL(params?.id as string),
		paginate: false,
	});
};

export default Page;
