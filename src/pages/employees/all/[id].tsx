import React from 'react';
import { ParsedUrlQuery } from 'querystring';

import { LOGIN_PAGE_URL } from '../../../config';
import Employee from '../../../containers/Employees/Detail';
import { getEmployee } from '../../../db';
import { authPage } from '../../../middlewares';
import { ExtendedGetServerSideProps, EmployeeType } from '../../../types';
import { Title } from '../../../utils';
import { serializeUserData } from '../../../utils/serializers';

const Page = ({ data }: { data: EmployeeType }) => (
	<React.Fragment>
		<Title title="Employee Information" />
		<Employee employee={data} />
	</React.Fragment>
);

interface IParams extends ParsedUrlQuery {
	id: string;
}

export const getServerSideProps: ExtendedGetServerSideProps = async ({
	req,
	res,
	params,
}) => {
	try {
		await authPage().run(req, res);
	} catch (error) {
		if (process.env.NODE_ENV === 'development')
			console.log('EMPLOYEE PAGE :>> ', error);
	}

	if (!req.user) {
		return {
			redirect: {
				destination: LOGIN_PAGE_URL,
				permanent: false,
			},
		};
	}

	const auth = await serializeUserData(req.user);
	const data = await getEmployee(params?.id as IParams['id']);

	if (!data) {
		return {
			notFound: true,
		};
	}

	return {
		props: {
			auth,
			data: JSON.parse(JSON.stringify(data)),
		},
	};
};

export default Page;
