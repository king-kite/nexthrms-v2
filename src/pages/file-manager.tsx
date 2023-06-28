import { DEFAULT_MEDIA_PAGINAITON_SIZE } from '../config/app';
import FileManager from '../containers/file-manager';
import { getManagedFiles } from '../db/queries/managed-files';
import { getRecords } from '../db/utils/record';
import { authPage } from '../middlewares';
import {
	ExtendedGetServerSideProps,
	GetManagedFilesResponseType,
} from '../types';
import Title from '../utils/components/title';
import { serializeUserData } from '../utils/serializers/auth';

function Page({ files }: { files?: GetManagedFilesResponseType['data'] }) {
	return (
		<>
			<Title title="File Manager" />
			<FileManager files={files} />
		</>
	);
}

export const getServerSideProps: ExtendedGetServerSideProps = async ({
	req,
	res,
}) => {
	try {
		await authPage().run(req, res);
	} catch (error) {
		if (process.env.NODE_ENV === 'development')
			console.log('FILE MANAGER PAGE ERROR :>> ', error);
	}

	if (!req.user) {
		return {
			props: {
				auth: null,
				errorPage: {
					statusCode: 401,
				},
			},
		};
	}

	const auth = await serializeUserData(req.user);

	const result = await getRecords({
		model: 'managed_files',
		perm: 'managedfile',
		user: req.user,
		query: {
			limit: DEFAULT_MEDIA_PAGINAITON_SIZE,
			offset: 0,
			search: '',
		},
		placeholder: {
			total: 0,
			result: [],
		},
		getData(params) {
			return getManagedFiles(params);
		},
	});

	if (result)
		return {
			props: {
				auth,
				files: result.data,
			},
		};

	return {
		props: {
			auth,
			errorPage: { statusCode: 403 },
		},
	};
};

export default Page;
