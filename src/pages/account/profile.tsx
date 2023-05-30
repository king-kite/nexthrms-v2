import Profile from '../../containers/account/profile';
import { getProfile } from '../../db';
import { authPage } from '../../middlewares';
import { ExtendedGetServerSideProps, ProfileType } from '../../types';
import { Title } from '../../utils';
import { serializeUserData } from '../../utils/serializers';

const Page = ({ profile }: { profile: ProfileType }) => (
	<>
		<Title title="Account Information" />
		<Profile profile={profile} />
	</>
);

export const getServerSideProps: ExtendedGetServerSideProps = async ({
	req,
	res,
}) => {
	try {
		await authPage().run(req, res);
	} catch (error) {
		if (process.env.NODE_ENV) console.log('PROFILE PAGE ERROR:>> ', error);
	}

	if (!req.user) {
		return {
			props: {
				auth: undefined,
				errorPage: {
					statusCode: 401,
				},
			},
		};
	}

	const auth = await serializeUserData(req.user);
	const profile = await getProfile(req.user.id);

	if (!profile) {
		return {
			notFound: true,
		};
	}

	return {
		props: {
			auth,
			profile: JSON.parse(JSON.stringify(profile)),
		},
	};
};

export default Page;
