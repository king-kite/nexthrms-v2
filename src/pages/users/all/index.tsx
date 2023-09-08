import type { GetServerSideProps } from 'next';

import { USERS_URL } from '../../../config/services';
import Users from '../../../containers/users';
import type { GetUsersResponseType } from '../../../types';
import Title from '../../../utils/components/title';
import { getServerSideData } from '../../../utils/server';

const Page = ({ data: users }: { data: GetUsersResponseType }) => (
	<>
		<Title title="User" />
		<Users users={users.data} />
	</>
);

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
	return await getServerSideData({
		req,
		res,
		url: USERS_URL,
	});
};

export default Page;
