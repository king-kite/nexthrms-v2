import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

import { PROFILE_URL } from '../../config/services';
import Profile from '../../containers/account/profile';
import type { ProfileResponseType } from '../../types';
import Title from '../../utils/components/title';
import { getServerSideData } from '../../utils/server';

const Page = ({ data: profile }: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title="Account Information" />
		<Profile profile={profile.data} />
	</>
);

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
	return await getServerSideData<ProfileResponseType>({
		req,
		res,
		url: PROFILE_URL,
		paginate: false,
	});
};

export default Page;
