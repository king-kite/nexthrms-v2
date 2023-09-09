import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

import { GROUP_URL } from '../../../config/services';
import Group from '../../../containers/users/groups/detail';
import Title from '../../../utils/components/title';
import { getServerSideData } from '../../../utils/server';

const Page = ({ data: group }: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title="Group Information" />
		<Group group={group?.data} />
	</>
);

export const getServerSideProps: GetServerSideProps = async ({ req, res, params }) => {
	return await getServerSideData({
		req,
		res,
		url: GROUP_URL(params?.id as string),
		paginate: false,
	});
};

export default Page;
