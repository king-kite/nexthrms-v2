import type { InferGetServerSidePropsType } from 'next';

import { DEFAULT_PAGINATION_SIZE } from '../../../config';
import Leaves from '../../../containers/leaves';
import { getLeaves } from '../../../db';
import { getUserObjects } from '../../../db/utils';
import { authPage } from '../../../middlewares';
import { ExtendedGetServerSideProps } from '../../../types';
import { Title } from '../../../utils';
import { serializeUserData } from '../../../utils/serializers';

const Page = ({
	leaves,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title="My Leave Requests" />
		<Leaves leaves={leaves} />
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
			props: {
				auth: undefined,
				errorPage: {
					statusCode: 401,
				},
			},
		};
	}

	const auth = await serializeUserData(req.user);
	if (!req.user.employee) {
		return {
			props: {
				auth,
				errorPage: {
					statusCode: 403,
					title: 'Forbidden. This page is reserved for employees only.',
				},
			},
		};
	}

	const records = await getUserObjects({
		modelName: 'leaves',
		permission: 'VIEW',
		userId: req.user.id,
	});
	if (records.length > 0) {
		const data = await getLeaves({
			limit: DEFAULT_PAGINATION_SIZE,
			offset: 0,
			id: req.user.employee.id,
			where: {
				id: {
					in: records.map((obj) => obj.objectId),
				},
			},
		});
		if (data.total > 0) {
			return {
				props: {
					auth,
					leaves: JSON.parse(JSON.stringify(data)),
				},
			};
		}
	}

	return {
		props: {
			auth,
			leaves: [],
		},
	};
};

export default Page;
