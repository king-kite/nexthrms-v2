import type { InferGetServerSidePropsType } from 'next';

import { EMPLOYEE_PAGE_URL, LOGIN_PAGE_URL } from '../../../config';
import Employee from '../../../containers/employees/detail';
import { getEmployee } from '../../../db';
import { getRecord, getUserObjectPermissions } from '../../../db/utils';
import { authPage } from '../../../middlewares';
import { ExtendedGetServerSideProps, EmployeeType } from '../../../types';
import { Title } from '../../../utils';
import { serializeUserData } from '../../../utils/serializers';
import { uuidSchema } from '../../../validators';

const Page = ({
	data,
	objPerm,
	objUserPerm,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title="Employee Information" />
		<Employee employee={data} objPerm={objPerm} objUserPerm={objUserPerm} />
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
			console.log('EMPLOYEE PAGE :>> ', error);
	}

	if (!req.user) {
		return {
			redirect: {
				destination: params?.id
					? LOGIN_PAGE_URL + `?next=${EMPLOYEE_PAGE_URL(params.id as string)}`
					: LOGIN_PAGE_URL,
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

	const record = await getRecord<EmployeeType | null>({
		model: 'employees',
		objectId: params?.id as string,
		perm: 'employee',
		user: req.user,
		getData() {
			return getEmployee(params?.id as string);
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
		objectId: record.data.user.id,
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
