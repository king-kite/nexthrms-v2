import type { InferGetServerSidePropsType } from 'next';

import { DEFAULT_PAGINATION_SIZE, LOGIN_PAGE_URL } from '../../config';
import Holidays from '../../containers/Holidays';
import { getHolidays } from '../../db';
import { getRecords } from '../../db/utils';
import { authPage } from '../../middlewares';
import { ExtendedGetServerSideProps } from '../../types';
import { Title } from '../../utils';
import { serializeUserData } from '../../utils/serializers';

const Page = ({
	data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<>
		<Title title="Holidays" />
		<Holidays holidays={data} />
	</>
);

export const getServerSideProps: ExtendedGetServerSideProps = async ({
	req,
	res,
}) => {
	try {
		await authPage().run(req, res);
	} catch (error) {
		if (process.env.NODE_ENV === 'development')
			console.log('HOLIDAYS PAGE :>> ', error);
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
	if (!req.user.employee) {
		return {
			props: {
				auth,
				errorPage: {
					statusCode: 403,
					title: 'Sorry, this page is reserverd for employees only.',
				},
			},
		};
	}

	const result = await getRecords({
		model: 'holiday',
		perm: 'holiday',
		query: {
			limit: DEFAULT_PAGINATION_SIZE,
			offset: 0,
			search: '',
		},
		user: req.user,
		placeholder: {
			total: 0,
			result: [],
		},
		getData(params) {
			return getHolidays(params);
		},
	});

	return {
		props: {
			auth,
			data: result
				? result.data
				: {
						total: 0,
						result: [],
				  },
		},
	};
};

export default Page;
