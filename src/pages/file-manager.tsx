import type { GetServerSideProps } from 'next';

import { MANAGED_FILES_URL } from '../config/services';
import FileManager from '../containers/file-manager';
import type { GetManagedFilesResponseType } from '../types';
import Title from '../utils/components/title';
import { getServerSideData } from '../utils/server';

const Page = ({ data: files }: { data: GetManagedFilesResponseType }) => (
	<>
		<Title title="Assets" />
		<FileManager files={files?.data} />
	</>
);

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
	return await getServerSideData({
		req,
		res,
		url: MANAGED_FILES_URL,
	});
};

export default Page;
