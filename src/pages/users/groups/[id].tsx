import type { InferGetServerSidePropsType } from 'next';

import {
	DEFAULT_PAGINATION_SIZE,
	GROUP_PAGE_URL,
	LOGIN_PAGE_URL,
} from '../../../config';
import Group from '../../../containers/users/groups/detail';
import { getGroup } from '../../../db';
import { getRecord } from '../../../db/utils';
import { authPage } from '../../../middlewares';
import { ExtendedGetServerSideProps, GroupType } from '../../../types';
import { Title } from '../../../utils';
import { serializeUserData } from '../../../utils/serializers';
import { uuidSchema } from '../../../validators';

const Page = ({
	data,
	objPerm,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title="Group Information" />
		<Group group={data} objPerm={objPerm} />
	</>
);

export const getServerSideProps: ExtendedGetServerSideProps = async ({
	req,
	res,
	params,
}) => {
	try {
		await authPage().run(req, res);
	} catch (error) {
		if (process.env.NODE_ENV === 'development')
			console.log('GROUP PAGE :>> ', error);
	}

	if (!req.user) {
		return {
			redirect: {
				destination: params?.id
					? LOGIN_PAGE_URL + `?next=${GROUP_PAGE_URL(params.id as string)}`
					: LOGIN_PAGE_URL,
				permanent: false,
			},
		};
	}

	const auth = await serializeUserData(req.user);
	// check is admin
	if (!req.user.isSuperUser && !req.user.isAdmin)
		return {
			props: {
				auth,
				errorPage: { statusCode: 403 },
			},
		};

	try {
		await uuidSchema.validateAsync(params?.id);
	} catch (error) {
		return {
			notFound: true,
		};
	}

	const record = await getRecord<GroupType | null>({
		model: 'groups',
		perm: 'group',
		objectId: params?.id as string,
		user: req.user,
		getData() {
			return getGroup(params?.id as string, {
				user: {
					limit: DEFAULT_PAGINATION_SIZE,
					offset: 0,
					search: '',
				},
			});
		},
	});

	if (!record)
		return {
			props: {
				auth,
				errorPage: {
					statusCode: 403,
				},
			},
		};

	if (!record.data) {
		return {
			notFound: true,
		};
	}

	return {
		props: {
			auth,
			objPerm: record.perm,
			data: record.data,
		},
	};
};

export default Page;
