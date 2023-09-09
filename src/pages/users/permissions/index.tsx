import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

import { PERMISSIONS_URL } from '../../../config/services';
import Permissions from '../../../containers/users/permissions';
import Title from '../../../utils/components/title';
import { getServerSideData } from '../../../utils/server';

const Page = ({ data: permissions }: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title="Permissions" />
		<Permissions permissions={permissions?.data} />
	</>
);

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
	return await getServerSideData({
		req,
		res,
		url: PERMISSIONS_URL,
	});
};

export default Page;
