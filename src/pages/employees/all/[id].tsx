import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';

import { EMPLOYEE_URL } from '../../../config/services';
import Employee from '../../../containers/employees/detail';
import Title from '../../../utils/components/title';
import { getServerSideData } from '../../../utils/server';

const Page = ({ data: employee }: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title="Employee Information" />
		<Employee employee={employee?.data} />
	</>
);

export const getServerSideProps: GetServerSideProps = async ({ req, res, params }) => {
	return await getServerSideData({
		req,
		res,
		url: EMPLOYEE_URL(params?.id as string),
		paginate: false,
	});
};

export default Page;
