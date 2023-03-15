import type { InferGetServerSidePropsType } from 'next';

import { LOGIN_PAGE_URL } from '../../../config';
import Overtime from '../../../containers/Overtime/Detail';
import { getOvertime } from '../../../db';
import { getUserObjectPermissions } from '../../../db/utils';
import { authPage } from '../../../middlewares';
import { ExtendedGetServerSideProps } from '../../../types';
import { Title } from '../../../utils';
import { serializeUserData } from '../../../utils/serializers';

const Page = ({
	overtime,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title="Overtime Request Information" />
		<Overtime overtime={overtime} />
	</>
);

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

	// check if the user has a view object permission for this record
	const objPerm = await getUserObjectPermissions({
		modelName: 'overtime',
		objectId: params?.id as string,
		userId: req.user.id,
	});
	if (objPerm.view === true) {
		const overtime = JSON.parse(
			JSON.stringify(await getOvertime(params?.id as string))
		);

		return {
			props: {
				auth,
				objPerm,
				overtime,
			},
		};
	}

	return {
		props: {
			auth,
			errorPage: { statusCode: 403 },
		},
	};
};

export default Page;
