import type { InferGetServerSidePropsType } from 'next';

import { DEFAULT_PAGINATION_SIZE } from '../../../config';
import User from '../../../containers/users/detail';
import {
	getUser,
	getUserGroups,
	getUserPermissions,
} from '../../../db/queries/users';
import { getRecord, getUserObjectPermissions } from '../../../db/utils';
import { authPage } from '../../../middlewares';
import { ExtendedGetServerSideProps, UserType } from '../../../types';
import Title from '../../../utils/components/title';
import { serializeUserData } from '../../../utils/serializers';
import { uuidSchema } from '../../../validators';

const Page = ({
	data,
	objPerm,
	objClientPerm,
	objEmployeePerm,
	groups,
	permissions,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title="User Information" />
		<User
			groups={groups}
			objPerm={objPerm}
			objClientPerm={objClientPerm}
			objEmployeePerm={objEmployeePerm}
			permissions={permissions}
			user={data}
		/>
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
			console.log('USER PAGE :>> ', error);
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

	try {
		await uuidSchema.validate(params?.id);
	} catch (error) {
		return {
			notFound: true,
		};
	}

	const record = await getRecord<UserType | null>({
		model: 'users',
		perm: 'user',
		objectId: params?.id as string,
		user: req.user,
		getData() {
			return getUser(params?.id as string);
		},
	});

	if (!record)
		return {
			props: {
				auth,
				errorPage: { statusCode: 403 },
			},
		};

	if (!record.data)
		return {
			notFound: true,
		};

	const groups = await getUserGroups(params?.id as string, {
		limit: DEFAULT_PAGINATION_SIZE,
		offset: 0,
		search: '',
	});
	const perms = await getUserPermissions(params?.id as string, {
		limit: DEFAULT_PAGINATION_SIZE,
		offset: 0,
		search: '',
	});

	// check if the user has a view object permission for this user's client record
	const objClientPerm = record.data.client
		? await getUserObjectPermissions({
				modelName: 'clients',
				objectId: record.data.client.id,
				userId: req.user.id,
				permission: 'VIEW',
		  })
		: null;

	// check if the user has a view object permission for this user's employee record
	const objEmployeePerm = record.data.employee
		? await getUserObjectPermissions({
				modelName: 'employees',
				objectId: record.data.employee.id,
				userId: req.user.id,
				permission: 'VIEW',
		  })
		: null;

	const props = {
		auth,
		objPerm: record.perm,
		data: record.data,
		groups: JSON.parse(JSON.stringify(groups)),
		permissions: JSON.parse(JSON.stringify(perms)),
	};

	if (objClientPerm) Object(props).objClientPerm = objClientPerm;
	if (objEmployeePerm) Object(props).objEmployeePerm = objEmployeePerm;

	return { props };
};

export default Page;
