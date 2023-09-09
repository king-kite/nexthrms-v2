import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

import { EMPLOYEES_URL } from '../../../config/services';
import Employees from '../../../containers/employees';
import Title from '../../../utils/components/title';
import { getServerSideData } from '../../../utils/server';

const Page = ({ data: employees }: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title="Employees" />
		<Employees employees={employees?.data} />
	</>
);

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
	return await getServerSideData({
		req,
		res,
		url: EMPLOYEES_URL,
	});
};

export default Page;
