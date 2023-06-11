import React from 'react';
import {
	FaClock,
	FaCloudDownloadAlt,
	FaCloudUploadAlt,
	FaFile,
	FaFolderOpen,
	FaFolderPlus,
	FaMusic,
	FaPlus,
	FaVideo,
	FaImages,
} from 'react-icons/fa';

import { Container } from '../components/common';
import {
	Breadcrumbs,
	BoxGrid,
	BoxTitle,
	FileTable,
	Files,
	Topbar,
} from '../components/file-manager';
import { getFileType, type NameKey } from '../components/file-manager/file';
import {
	permissions,
	DEFAULT_PAGINATION_SIZE,
	MEDIA_URL,
	MEDIA_HIDDEN_FILE_NAME,
} from '../config';
import { useAlertContext, useAuthContext } from '../store/contexts';
import { useGetManagedFilesQuery } from '../store/queries';
import { GetManagedFilesResponseType } from '../types';
import { hasModelPermission } from '../utils';

function FileManager({
	files: initialData,
}: {
	files?: GetManagedFilesResponseType['data'];
}) {
	const [offset, setOffset] = React.useState(0);
	const [limit, setLimit] = React.useState(DEFAULT_PAGINATION_SIZE);
	const [searchForm, setSearchForm] = React.useState<{
		search?: string;
		from?: string;
		to?: string;
	}>();

	const { open } = useAlertContext();
	const { data: authData } = useAuthContext();

	const [dir, setDir] = React.useState(MEDIA_URL);

	const [type, setType] = React.useState<NameKey | 'document' | 'recent' | null>(null);

	const [canCreate, canView] = React.useMemo(() => {
		const canCreate = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [
					permissions.managedfile.CREATE,
			  ])
			: false;
		// Added Object Level Permissions As Well
		const canView = authData
			? authData.isSuperUser ||
			  hasModelPermission(authData.permissions, [
					permissions.managedfile.VIEW,
			  ]) ||
			  // check object permission
			  !!authData?.objPermissions.find(
					(perm) =>
						perm.modelName === 'managed_files' && perm.permission === 'VIEW'
			  )
			: false;

		return [canCreate, canView];
	}, [authData]);

	const { data, isFetching, refetch } = useGetManagedFilesQuery(
		{
			limit,
			offset,
			search: searchForm?.search,
			from: searchForm?.from,
			to: searchForm?.to,
			onError(error) {
				open({
					message: error.message || 'Fetch Error. Unable to get files!',
					type: 'danger',
				});
			},
		},
		{
			initialData: initialData ? () => initialData : undefined,
		}
	);

	const files = React.useMemo(() => {
		if (!data) return [];

		let _files = data.result.filter((file) => {
			if (
				file.name.includes(MEDIA_HIDDEN_FILE_NAME) ||
				file.url.includes(MEDIA_HIDDEN_FILE_NAME)
			)
				return false;
			return true;
		});

		// recent
		if (type === 'recent') {
			_files = _files.slice(0, 5);
		} else if (type !== null && ['audio', 'image', 'video'].includes(type)) {
			// audio, image, video
			_files = _files.filter((file) => {
				const fileType = getFileType(file.type, file.url, file.name);
				if (type === fileType) return true;
				return false;
			});
		} else if (type !== null && type === 'document') {
			// files e.g. word, zip, pdf
			// if file is not an audio, image, video
			_files = _files.filter((file) => {
				const fileType = getFileType(file.type, file.url, file.name);
				if (!['audio', 'image', 'video'].includes(fileType)) return true;
				return false;
			});
		}

		return _files;
	}, [data, type]);

	const actions = [
		{
			bg: 'bg-gray-500',
			icon: FaPlus,
			title: 'New File',
		},
		{
			bg: 'bg-gray-500',
			icon: FaFolderPlus,
			title: 'New Folder',
		},
		{
			bg: 'bg-violet-500',
			icon: FaCloudUploadAlt,
			title: 'Import',
		},
		{
			bg: 'bg-sky-500',
			icon: FaCloudDownloadAlt,
			title: 'Export',
		},
	];

	const accesses = React.useMemo(() => [
		{
			bg: 'bg-indigo-500',
			icon: FaFolderOpen,
			onClick: () => setType(null),
			title: 'all',
		},
		{
			bg: 'bg-blue-500',
			icon: FaImages,
			onClick: () => setType('image'),
			title: 'images',
		},
		{
			bg: 'bg-purple-500',
			icon: FaMusic,
			onClick: () => setType('audio'),
			title: 'audios',
		},
		{
			bg: 'bg-green-500',
			icon: FaVideo,
			onClick: () => setType('video'),
			title: 'videos',
		},
		{
			bg: 'bg-yellow-500',
			icon: FaFile,
			onClick: () => setType('document'),
			title: 'documents',
		},
		{
			bg: 'bg-sky-500',
			icon: FaClock,
			onClick: () => setType('recent'),
			title: 'recent',
		},
	], []);

	return (
		<Container
			background="bg-white"
			heading="File Manager"
			refresh={{
				loading: isFetching,
				onClick: refetch,
			}}
			error={!canView && !canCreate ? { statusCode: 403 } : undefined}
		>
			<div className="my-2 md:my-4">
				<BoxTitle title="quick actions" />
				<BoxGrid actions={actions} />
			</div>

			<div className="my-2 md:my-4">
				<BoxTitle title="quick access" />
				<BoxGrid actions={accesses} />
			</div>

			<div className="my-2 md:my-4">
				<h3 className="capitalize my-3 py-2 text-gray-700 text-lg md:text-xl lg:text-2xl">
					Recent Files
				</h3>
				<div className="bg-gray-200 h-[1px] my-5 w-full">
					<div className="bg-primary-500 h-[1px] w-1/5" />
				</div>
				<div className="my-3 py-2">
					<FileTable files={files} />
				</div>
			</div>

			{/* <Breadcrumbs dir={dir} setDir={setDir} />
			{canCreate && <Topbar />}
			{data?.result && <Files data={data.result} dir={dir} setDir={setDir} />} */}
		</Container>
	);
}

export default FileManager;
