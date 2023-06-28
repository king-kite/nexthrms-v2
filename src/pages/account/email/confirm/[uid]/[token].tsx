import { GetServerSideProps } from 'next';
import { ParsedUrlQuery } from 'querystring';

import SplashScreen from '../../../../../components/common/splash-screen';
import {
	LOGIN_PAGE_URL,
	REQUEST_EMAIL_VERIFY_PAGE_URL,
} from '../../../../../config/routes';
import prisma from '../../../../../db/client';
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

		// Get the token provided in the request body
		const savedToken = await prisma.token.findUnique({
			where: {
				token: valid.token,
			},
			select: {
				expires: true,
				type: true,
				uid: true,
				token: true,
			},
		});

		// Return a 400 error is token is not found, expired or
		// is not an email verification token
		// the user id saved on the token is not the same as the uid
		// in the request body
		if (
			!savedToken ||
			savedToken.type !== 'EMAIL_VERIFICATION' ||
			savedToken.expires.getTime() <= Date.now() ||
			savedToken.uid !== valid.uid
		) {
			return {
				redirect: {
					destination: REQUEST_EMAIL_VERIFY_PAGE_URL,
					permanent: false,
				},
			};
		}

		// Set the user email as verified
		await prisma.user.update({
			where: {
				id: savedToken.uid,
			},
			data: {
				isEmailVerified: true,
			},
		});

		// Delete the token
		await prisma.token.delete({
			where: {
				token: savedToken.token,
			},
		});

		return {
			redirect: {
				destination: LOGIN_PAGE_URL,
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
