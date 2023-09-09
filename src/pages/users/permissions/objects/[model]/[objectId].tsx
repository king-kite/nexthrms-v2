import { GetServerSideProps, InferGetServerSidePropsType } from 'next';

import { OBJECT_PERMISSIONS_URL } from '../../../../../config/services';
import ObjectPermissions from '../../../../../containers/users/permissions/objects';
import Title from '../../../../../utils/components/title';
import { getServerSideData } from '../../../../../utils/server';

const Page = ({ data: permissions }: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title="Record Permissions" />
		<ObjectPermissions permissions={permissions?.data} />
	</>
);

export const getServerSideProps: GetServerSideProps = async ({ req, res, params }) => {
	return await getServerSideData({
		req,
		res,
		url: OBJECT_PERMISSIONS_URL(params?.model as string, params?.objectId as string),
		paginate: false,
	});
};

export default Page;
