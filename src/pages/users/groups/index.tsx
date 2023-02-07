import React from 'react';

import { DEFAULT_PAGINATION_SIZE, LOGIN_PAGE_URL } from '../../../config';
import Groups from '../../../containers/Users/Groups';
import { getGroups } from '../../../db';
import { authPage } from '../../../middlewares';
import {
	ExtendedGetServerSideProps,
	GetGroupsResponseType,
} from '../../../types';
import { Title } from '../../../utils';
import { serializeUserData } from '../../../utils/serializers';

const Page = ({ data }: { data: GetGroupsResponseType['data'] }) => (
	<React.Fragment>
		<Title title="Groups" />
		<Groups groups={data} />
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
			console.log('GROUPS PAGE :>> ', error);
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
	const data = await getGroups({
		limit: DEFAULT_PAGINATION_SIZE,
		offset: 0,
		search: '',
		users: {
			limit: DEFAULT_PAGINATION_SIZE,
			offset: 0,
			search: '',
		},
	});

	return {
		props: {
			auth,
			data: JSON.parse(JSON.stringify(data)),
		},
	};
};

export default Page;