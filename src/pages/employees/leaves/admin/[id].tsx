import type { InferGetServerSidePropsType } from 'next';
import Router from 'next/router';

import { LOGIN_PAGE_URL } from '../../../../config';
import Leave from '../../../../containers/leaves/detail';
import { getLeave } from '../../../../db';
import { getRecord } from '../../../../db/utils';
import { authPage } from '../../../../middlewares';
import { ExtendedGetServerSideProps, LeaveType } from '../../../../types';
import { Title } from '../../../../utils';
import { serializeUserData } from '../../../../utils/serializers';
import { uuidSchema } from '../../../../validators';

const Page = ({
	objPerm,
	data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title="Employee Leave Request" />
		<Leave admin leave={data} objPerm={objPerm} />
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
				destination: LOGIN_PAGE_URL + `?next=${Router.asPath}`,
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

	const record = await getRecord<LeaveType | null>({
		model: 'leaves',
		objectId: params?.id as string,
		perm: 'leave',
		user: req.user,
		getData() {
			return getLeave(params?.id as string);
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
