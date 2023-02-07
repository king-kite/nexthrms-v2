import React from 'react';
import { ParsedUrlQuery } from 'querystring';

import { DEFAULT_PAGINATION_SIZE, LOGIN_PAGE_URL } from '../../../config';
import Group from '../../../containers/Users/Groups/Detail';
import { getGroup } from '../../../db';
import { authPage } from '../../../middlewares';
import { ExtendedGetServerSideProps, GroupType } from '../../../types';
import { Title } from '../../../utils';
import { serializeUserData } from '../../../utils/serializers';

const Page = ({ data }: { data: GroupType }) => (
	<React.Fragment>
		<Title title="Group Information" />
		<Group group={data} />
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
			console.log('GROUP PAGE :>> ', error);
	}

	if (!req.user) {
		return {
			redirect: {
				destination: LOGIN_PAGE_URL,
				permanent: false,
			},
		};
	}

	const auth = serializeUserData(req.user);
	const data = await getGroup(params?.id as IParams['id'], {
		user: {
			limit: DEFAULT_PAGINATION_SIZE,
			offset: 0,
			search: '',
		},
	});

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
