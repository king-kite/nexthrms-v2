import type { GetServerSideProps } from 'next';

import { ASSETS_URL } from '../config/services';
import Assets from '../containers/assets';
import type { GetAssetsResponseType } from '../types';
import Title from '../utils/components/title';
import { getServerSideData } from '../utils/server';

const Page = ({ data: assets }: { data: GetAssetsResponseType }) => (
	<>
		<Title title="Assets" />
		<Assets assets={assets.data} />
	</>
);

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
	return await getServerSideData({
		req,
		res,
		url: ASSETS_URL,
	});
};

export default Page;
