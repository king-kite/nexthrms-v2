import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

import { GROUPS_URL } from '../../../config/services';
import Groups from '../../../containers/users/groups';
import Title from '../../../utils/components/title';
import { getServerSideData } from '../../../utils/server';

const Page = ({ data: groups }: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title="Groups" />
		<Groups groups={groups?.data} />
	</>
);

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
	return await getServerSideData({
		req,
		res,
		url: GROUPS_URL,
	});
};

export default Page;
