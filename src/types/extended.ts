import type {
	GetServerSidePropsContext,
	GetServerSidePropsResult,
	NextApiRequest,
	PreviewData,
} from 'next';
import { ParsedUrlQuery } from 'querystring';

import { GroupType, PermissionType } from './users';

export type RequestUserEmployeeType = {
	id: string;
	job: {
		name: string;
	} | null;
};

export type RequestUserType = {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	fullName: string;
	isActive: boolean;
	isSuperUser: boolean;
	isAdmin: boolean;
	isEmailVerified: boolean;
	profile: {
		image: {
			id: string;
			url: string;
		} | null;
	} | null;
	employee: RequestUserEmployeeType | null;
	groups: Omit<GroupType, 'users'>[];
	permissions: PermissionType[];
	allPermissions: PermissionType[]; // contains all the permissions from the user and the groups as well.
	checkPassword: (password: string) => Promise<boolean>;
};

// Add the user object to the Next Api Route.
// To be used for /api/ routes and with the auth() next-connect middleware
export interface NextApiRequestExtendUser extends NextApiRequest {
	user: RequestUserType;
}

// Prevents the employee object in the request user from been typed as null
// To be used for /api/ routes and with the employee() next-connect middleware
export interface NextApiRequestExtendEmployee extends NextApiRequestExtendUser {
	user: Omit<RequestUserType, 'employee'> & {
		employee: RequestUserEmployeeType;
	};
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
