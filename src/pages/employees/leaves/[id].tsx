import type { InferGetServerSidePropsType } from 'next';

import { LOGIN_PAGE_URL } from '../../../config';
import Leave from '../../../containers/Leaves/Detail';
import { getLeave } from '../../../db';
import { getUserObjectPermissions } from '../../../db/utils';
import { authPage } from '../../../middlewares';
import { ExtendedGetServerSideProps } from '../../../types';
import { Title } from '../../../utils';
import { serializeUserData } from '../../../utils/serializers';

const Page = ({
	leave,
	objPerm,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title="My Leave Request" />
		<Leave leave={leave} objPerm={objPerm} />
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
		modelName: 'leaves',
		objectId: params?.id as string,
		userId: req.user.id,
	});
	if (objPerm.view === true) {
		const leave = JSON.parse(
			JSON.stringify(await getLeave(params?.id as string))
		);

		return {
			props: {
				auth,
				objPerm,
				leave,
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
