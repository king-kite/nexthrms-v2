import type { GetServerSideProps } from 'next';

import { USER_URL } from '../../../config/services';
import User from '../../../containers/users/detail';
import type { SuccessResponseType, UserType } from '../../../types';
import Title from '../../../utils/components/title';
import { getServerSideData } from '../../../utils/server';

const Page = ({ data: user }: { data: SuccessResponseType<UserType> }) => (
	<>
		<Title title="User" />
		<User user={user.data} />
	</>
);

export const getServerSideProps: GetServerSideProps = async ({ req, params, res }) => {
	return await getServerSideData({
		req,
		res,
		url: USER_URL(params?.id as string),
		paginate: false,
	});
};

export default Page;
