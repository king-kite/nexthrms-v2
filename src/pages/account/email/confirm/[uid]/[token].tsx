import axios from 'axios';
import { GetServerSideProps } from 'next';
import { ParsedUrlQuery } from 'querystring';

import SplashScreen from '../../../../../components/common/splash-screen';
import { LOGIN_PAGE_URL, REQUEST_EMAIL_VERIFY_PAGE_URL } from '../../../../../config/routes';
import { EMAIL_CONFIRM_URL } from '../../../../../config/services';
import { verifyUidTokenSchema } from '../../../../../validators/auth';

function Page() {
	return <SplashScreen />;
}

interface IParams extends ParsedUrlQuery {
	uid: string;
	token: string;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
	try {
		const { uid, token } = params as IParams;

		// validate the request params
		const valid = await verifyUidTokenSchema.validate({ uid, token });

		const response = await axios.post(EMAIL_CONFIRM_URL, valid);

		if (response.status === 200)
			return {
				redirect: {
					destination: LOGIN_PAGE_URL,
					permanent: false,
				},
			};
		return {
			redirect: {
				destination: REQUEST_EMAIL_VERIFY_PAGE_URL,
				permanent: false,
			},
		};
	} catch (error) {
		return {
			redirect: {
				destination: REQUEST_EMAIL_VERIFY_PAGE_URL,
				permanent: false,
			},
		};
	}
};

Page.authRequired = false;

export default Page;
