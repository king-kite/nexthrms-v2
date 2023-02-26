import type { InferGetServerSidePropsType } from 'next';
import React from 'react';

import { LOGIN_PAGE_URL } from '../../config';
import Holidays from '../../containers/Holidays';
import { getHolidays } from '../../db';
import { authPage } from '../../middlewares';
import { ExtendedGetServerSideProps } from '../../types';
import { Title } from '../../utils';
import { serializeUserData } from '../../utils/serializers';

const Page = ({
	data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => (
	<React.Fragment>
		<Title title="Holidays" />
		<Holidays holidays={data} />
	</React.Fragment>
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
	const data = await getHolidays();

	return {
		props: {
			auth,
			data: JSON.parse(JSON.stringify(data)),
		},
	};
};

export default Page;
