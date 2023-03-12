import type { InferGetServerSidePropsType } from 'next';

import { DEFAULT_PAGINATION_SIZE, LOGIN_PAGE_URL } from '../../../../config';
import Leaves from '../../../../containers/Admin/Leaves';
import { getLeavesAdmin } from '../../../../db';
import { getRecords } from '../../../../db/utils';
import { authPage } from '../../../../middlewares';
import {
	ExtendedGetServerSideProps,
	GetLeavesResponseType,
} from '../../../../types';
import { Title } from '../../../../utils';
import { serializeUserData } from '../../../../utils/serializers';

const Page = ({
	leaves,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title="Employees Leave Requests" />
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
			console.log('LEAVES ADMIN PAGE :>> ', error);
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

	// Check is admin
	if (!req.user.isAdmin && !req.user.isSuperUser)
		return {
			props: {
				auth,
				errorPage: {
					statusCode: 403,
				},
			},
		};

	if (!req.user.employee) {
		return {
			props: {
				auth,
				errorPage: {
					statusCode: 403,
				},
			},
		};
	}

	const result = await getRecords<GetLeavesResponseType['data']>({
		model: 'leaves',
		perm: 'leave',
		query: {
			limit: DEFAULT_PAGINATION_SIZE,
			offset: 0,
			search: '',
		},
		user: req.user,
		placeholder: {
			total: 0,
			approved: 0,
			denied: 0,
			pending: 0,
			result: [],
		},
		getData(params) {
			return getLeavesAdmin(params);
		},
	});

	if (result)
		return {
			props: {
				auth,
				data: result.data,
			},
		};

	return {
		props: {
			auth,
			errorPage: {
				statusCode: 403,
			},
		},
	};
};

export default Page;
