import type { InferGetServerSidePropsType } from 'next';

import { DEFAULT_PAGINATION_SIZE } from '../../../config/app';
import Group from '../../../containers/users/groups/detail';
import { getGroup } from '../../../db/queries/groups';
import { getRecord } from '../../../db/utils/record';
import { authPage } from '../../../middlewares';
import { ExtendedGetServerSideProps, GroupType } from '../../../types';
import Title from '../../../utils/components/title';
import { serializeUserData } from '../../../utils/serializers/auth';
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
			props: {
				auth: null,
				errorPage: {
					statusCode: 401,
				},
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
		await uuidSchema.validate(params?.id);
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
