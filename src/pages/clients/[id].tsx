import type { InferGetServerSidePropsType } from 'next';

import ClientDetail from '../../containers/clients/detail';
import { getClient } from '../../db/queries/clients';
import { getUserObjectPermissions } from '../../db/utils/permission';
import { getRecord } from '../../db/utils/record';
import { authPage } from '../../middlewares';
import { ExtendedGetServerSideProps, ClientType } from '../../types';
import Title from '../../utils/components/title';
import { serializeUserData } from '../../utils/serializers/auth';
import { uuidSchema } from '../../validators';

const Page = ({
	data,
	objPerm,
	objUserPerm,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title="Client Information" />
		<ClientDetail client={data} objPerm={objPerm} objUserPerm={objUserPerm} />
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
			console.log('CLIENT PAGE :>> ', error);
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

	const record = await getRecord<ClientType | null>({
		model: 'clients',
		objectId: params?.id as string,
		perm: 'client',
		user: req.user,
		getData() {
			return getClient(params?.id as string);
		},
	});

	if (!record)
		return {
			props: {
				auth,
				errorPage: { statusCode: 403 },
			},
		};

	if (!record.data) {
		return {
			notFound: true,
		};
	}

	const objUserPerm = await getUserObjectPermissions({
		modelName: 'users',
		objectId: record.data.contact.id as string, // contact represents user in the relation
		userId: req.user.id,
	});

	return {
		props: {
			auth,
			data: record.data,
			objPerm: record.perm,
			objUserPerm,
		},
	};
};

export default Page;
