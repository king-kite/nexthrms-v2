import type {
	GetServerSidePropsContext,
	GetServerSidePropsResult,
	NextApiRequest,
	PreviewData,
} from 'next';
import { ParsedUrlQuery } from 'querystring';

export type RequestUserType = {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	fullName: string;
	isActive: boolean;
	isEmailVerified: boolean;
	profile: {
		image: string;
	} | null;
	employee: {
		id: string;
		job: {
			name: string;
		} | null;
	} | null;
	checkPassword: (password: string) => Promise<boolean>;
};

// Add the user object to the Next Api Route.
// To be used for /api/ routes and with the auth() next-connect middleware
export interface NextApiRequestExtendUser extends NextApiRequest {
	user: RequestUserType;
}

// Add the user object to the getServerSideProps pages function.
// To be used for "Next Pages" and with the authPages() next-connect middleware.

export type ExtendedGetServerSideProps<
	P extends { [key: string]: any } = { [key: string]: any },
	Q extends ParsedUrlQuery = ParsedUrlQuery,
	D extends PreviewData = PreviewData
> = (
	context: ExtendedGetServerSidePropsContext<Q, D>
) => Promise<GetServerSidePropsResult<P>>;

type GetServerSidePropsContextRequest = GetServerSidePropsContext['req'];
interface ExtendedGetServerSidePropsContextRequest
	extends GetServerSidePropsContextRequest {
	user?: Omit<RequestUserType, 'checkPassword'>;
}
interface ExtendedGetServerSidePropsContext<
	Q extends ParsedUrlQuery = ParsedUrlQuery,
	D extends PreviewData = PreviewData
> extends GetServerSidePropsContext<Q, D> {
	req: ExtendedGetServerSidePropsContextRequest;
}
