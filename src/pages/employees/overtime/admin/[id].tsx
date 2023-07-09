import type { InferGetServerSidePropsType } from 'next';

import Overtime from '../../../../containers/overtime/detail';
import { getOvertime } from '../../../../db/queries/overtime';
import { getRecord } from '../../../../db/utils/record';
import { authPage } from '../../../../middlewares';
import { ExtendedGetServerSideProps } from '../../../../types';
import Title from '../../../../utils/components/title';
import { serializeUserData } from '../../../../utils/serializers/auth';
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
			props: {
				auth: null,
				errorPage: {
					statusCode: 401,
				},
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
		await uuidSchema.validate(params?.id);
	} catch (error) {
		return {
			notFound: true,
		};
	}

	const record = await getRecord({
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
