import type { InferGetServerSidePropsType } from 'next';
import Router from 'next/router';

import { LOGIN_PAGE_URL } from '../../config';
import ClientDetail from '../../containers/Clients/Detail';
import { getClient } from '../../db';
import { getRecord, getUserObjectPermissions } from '../../db/utils';
import { authPage } from '../../middlewares';
import { ExtendedGetServerSideProps, ClientType } from '../../types';
import { Title } from '../../utils';
import { serializeUserData } from '../../utils/serializers';
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
			redirect: {
				destination: LOGIN_PAGE_URL + `?next=${Router.asPath}`,
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

	try {
		await uuidSchema.validateAsync(params?.id);
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
