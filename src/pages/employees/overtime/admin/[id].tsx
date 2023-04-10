import type { InferGetServerSidePropsType } from 'next';

import { LOGIN_PAGE_URL } from '../../../../config';
import Overtime from '../../../../containers/Overtime/Detail';
import { getOvertime } from '../../../../db';
import { getRecord } from '../../../../db/utils';
import { authPage } from '../../../../middlewares';
import { ExtendedGetServerSideProps, OvertimeType } from '../../../../types';
import { Title } from '../../../../utils';
import { serializeUserData } from '../../../../utils/serializers';
import { uuidSchema } from '../../../../validators';

const Page = ({
	data,
	objPerm,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title="Employee Overtime Request Information" />
		<Overtime admin overtime={data} objPerm={objPerm} />
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

	// Some users can still view but can't edit
	// if (!req.user.employee) {
	// 	return {
	// 		props: {
	// 			auth,
	// 			errorPage: {
	// 				statusCode: 403,
	// 			},
	// 		},
	// 	};
	// }

	try {
		await uuidSchema.validateAsync(params?.id);
	} catch (error) {
		return {
			notFound: true,
		};
	}

	const record = await getRecord<OvertimeType | null>({
		model: 'overtime',
		objectId: params?.id as string,
		perm: 'overtime',
		user: req.user,
		getData() {
			return getOvertime(params?.id as string);
		},
	});

	if (!record)
		return {
			props: {
				auth,
				errorPage: { statusCode: 403 },
			},
		};

	if (!record.data) return { notFound: true };

	return {
		props: {
			auth,
			data: record.data,
			objPerm: record.perm,
		},
	};
};

export default Page;
