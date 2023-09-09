import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

import { DEPARTMENTS_URL } from '../../../config/services';
import Departments from '../../../containers/departments';
import Title from '../../../utils/components/title';
import { getServerSideData } from '../../../utils/server';

function Page({ data: departments }: InferGetServerSidePropsType<typeof getServerSideProps>) {
	return (
		<>
			<Title title="Departments" />
			<Departments departments={departments?.data} />
		</>
	);
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
	return await getServerSideData({
		req,
		res,
		url: DEPARTMENTS_URL,
	});
};

export default Page;
