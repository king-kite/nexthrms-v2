import type { InferGetServerSidePropsType } from 'next';

import { DEFAULT_PAGINATION_SIZE, LOGIN_PAGE_URL } from '../../../config';
import Overtime from '../../../containers/overtime';
import { getAllOvertime } from '../../../db';
import { getUserObjects } from '../../../db/utils';
import { authPage } from '../../../middlewares';
import { ExtendedGetServerSideProps } from '../../../types';
import { Title } from '../../../utils';
import { serializeUserData } from '../../../utils/serializers';

const Page = ({
	overtime,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title="My Overtime Requests" />
		<Overtime overtime={overtime} />
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
			console.log('OVERTIME PAGE :>> ', error);
	}

	if (!req.user) {
		return {
			redirect: {
				destination: req.url
					? LOGIN_PAGE_URL + `?next=${req.url}`
					: LOGIN_PAGE_URL,
				permanent: false,
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
		modelName: 'overtime',
		permission: 'VIEW',
		userId: req.user.id,
	});
	if (records.length > 0) {
		const data = await getAllOvertime({
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
					overtime: JSON.parse(JSON.stringify(data)),
				},
			};
		}
	}

	return {
		props: {
			auth,
			overtime: [],
		},
	};
};

export default Page;
