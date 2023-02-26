import { InferGetServerSidePropsType } from 'next';
import Error from 'next/error';
import { ParsedUrlQuery } from 'querystring';

import { LOGIN_PAGE_URL } from '../../../../config';
import Overtime from '../../../../containers/Overtime/Detail';
import { getOvertime } from '../../../../db';
import { authPage } from '../../../../middlewares';
import { ExtendedGetServerSideProps, OvertimeType } from '../../../../types';
import { Title } from '../../../../utils';
import { serializeUserData } from '../../../../utils/serializers';

const Page = ({
	error,
	overtime,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		{error ? (
			<Error title={error.title} statusCode={error.statusCode} />
		) : (
			<>
				<Title title="Employee Overtime Request Information" />
				<Overtime admin overtime={overtime} />
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
		if (process.env.NODE_ENV) console.log('OVERTIME DETAIL ERROR :>> ', error);
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

	const auth = await serializeUserData(req.user);
	const overtime: OvertimeType = JSON.parse(
		JSON.stringify(await getOvertime(id))
	);

	return {
		props: {
			auth,
			overtime,
		},
	};
};

export default Page;
