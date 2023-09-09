import type { GetServerSideProps } from 'next';

import { DEFAULT_MEDIA_PAGINAITON_SIZE } from '../config/app';
import { MANAGED_FILES_URL } from '../config/services';
import FileManager from '../containers/file-manager';
import type { GetManagedFilesResponseType } from '../types';
import Title from '../utils/components/title';
import { getServerSideData } from '../utils/server';

const Page = ({ data: files }: { data: GetManagedFilesResponseType }) => (
	<>
		<Title title="File Manager" />
		<FileManager files={files?.data} />
	</>
);

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
	return await getServerSideData({
		req,
		res,
		url: MANAGED_FILES_URL,
		paginate: {
			limit: DEFAULT_MEDIA_PAGINAITON_SIZE,
		},
	});
};

export default Page;
