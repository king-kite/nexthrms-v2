import { InferGetServerSidePropsType } from 'next';
import Error from 'next/error';
import { ParsedUrlQuery } from 'querystring';

import { LOGIN_PAGE_URL } from '../../../../config';
import Leave from '../../../../containers/Leaves/Detail';
import { getLeave } from '../../../../db';
import { authPage } from '../../../../middlewares';
import { ExtendedGetServerSideProps, LeaveType } from '../../../../types';
import { Title } from '../../../../utils';
import { serializeUserData } from '../../../../utils/serializers';

const Page = ({
	error,
	leave,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		{error ? (
			<Error title={error.title} statusCode={error.statusCode} />
		) : (
			<>
				<Title title="Employee Leave Request" />
				<Leave admin leave={leave} />
			</>
		)}
	</>
);

interface IParams extends ParsedUrlQuery {
	id: string;
}

export const getServerSideProps: ExtendedGetServerSideProps = async ({
	params,
	req,
	res,
}) => {
	try {
		await authPage().run(req, res);
	} catch (error) {
		if (process.env.NODE_ENV) console.log('LEAVE ERROR :>> ', error);
	}

	if (!req.user) {
		return {
			redirect: {
				destination: LOGIN_PAGE_URL,
				permanent: false,
			},
		};
	}

	if (!req.user.employee) {
		return {
			props: {
				error: {
					statusCode: 403,
					title: 'Only employees can view this page',
				},
			},
		};
	}

	const { id } = params as IParams;

	const auth = serializeUserData(req.user);
	const leave: LeaveType = JSON.parse(JSON.stringify(await getLeave(id)));

	return {
		props: {
			auth,
			leave,
		},
	};
};

export default Page;
