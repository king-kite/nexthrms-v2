import { InferGetServerSidePropsType } from 'next';
import Error from 'next/error';

import { LOGIN_PAGE_URL } from '../../../../config';
import Overtime from '../../../../containers/Admin/Overtime';
import { getAllOvertimeAdmin } from '../../../../db';
import { authPage } from '../../../../middlewares';
import {
	ExtendedGetServerSideProps,
	GetAllOvertimeResponseType,
} from '../../../../types';
import { Title } from '../../../../utils';
import { serializeUserData } from '../../../../utils/serializers';

const Page = ({
	error,
	overtime,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title="Employees Overtime Requests" />
		{error ? (
			<Error statusCode={error.statusCode} title={error.title} />
		) : (
			<Overtime overtime={overtime} />
		)}
	</>
);

export const getServerSideProps: ExtendedGetServerSideProps = async ({
	req,
	res,
}) => {
	try {
		await authPage().run(req, res);
	} catch (error) {
		if (process.env.NODE_ENV === 'development')
			console.log('OVERTIME ADMIN PAGE :>> ', error);
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
					title: 'Request Forbidden. Only employees can view this Page!',
				},
			},
		};
	}

	const auth = await serializeUserData(req.user);
	const overtime: GetAllOvertimeResponseType['data'] = JSON.parse(
		JSON.stringify(await getAllOvertimeAdmin())
	);

	return {
		props: {
			auth,
			overtime,
		},
	};
};

export default Page;
