import { InferGetServerSidePropsType } from 'next';
import Error from 'next/error';

import { LOGIN_PAGE_URL } from '../../../config';
import Leaves from '../../../containers/Leaves';
import { getLeaves } from '../../../db';
import { authPage } from '../../../middlewares';
import { ExtendedGetServerSideProps, GetLeavesResponseType } from '../../../types';
import { Title } from '../../../utils';
import { serializeUserData } from '../../../utils/serializers';

const Page = ({
	error,
	leaves,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title="Leave Requests" />
		{error ? (
			<Error statusCode={error.statusCode} title={error.title} />
		) : (
			<Leaves leaves={leaves} />
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
			console.log('LEAVES PAGE :>> ', error);
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

	const auth = serializeUserData(req.user);
	const leaves: GetLeavesResponseType['data'] = JSON.parse(
		JSON.stringify(await getLeaves({ id: req.user.employee.id }))
	);

	return {
		props: {
			auth,
			leaves,
		},
	};
};

export default Page;
