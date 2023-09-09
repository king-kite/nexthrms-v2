import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

import { OVERTIME_ADMIN_DETAIL_URL } from '../../../../config/services';
import Overtime from '../../../../containers/overtime/detail';
import Title from '../../../../utils/components/title';
import { getServerSideData } from '../../../../utils/server';

const Page = ({ data: overtime }: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title="Employee Overtime Request Information" />
		<Overtime admin overtime={overtime?.data} />
	</>
);

export const getServerSideProps: GetServerSideProps = async ({ req, res, params }) => {
	return await getServerSideData({
		req,
		res,
		url: OVERTIME_ADMIN_DETAIL_URL(params?.id as string),
		paginate: false,
	});
};

export default Page;
