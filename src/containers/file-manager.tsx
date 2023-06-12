import { useRouter } from 'next/router';
import React from 'react';
import {
	FaClock,
	FaCloudDownloadAlt,
	FaCloudUploadAlt,
	FaFile,
	FaFolderOpen,
	FaFolderPlus,
	FaFolderMinus,
	FaImages,
	FaLongArrowAltLeft,
	FaMusic,
	FaPlus,
	FaVideo,
} from 'react-icons/fa';

import { Container } from '../components/common';
import {
	Breadcrumbs,
	BoxGrid,
	BoxTitle,
	FileAction,
	FileEmpty,
	FileTable,
	Files,
} from '../components/file-manager';
import { getFileType } from '../components/file-manager/file';
import {
	permissions,
	DEFAULT_PAGINATION_SIZE,
	FILE_MANAGER_PAGE_URL,
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

	const { query, push } = useRouter();

	const { open } = useAlertContext();
	const { data: authData } = useAuthContext();

	const [dir, setDir] = React.useState(MEDIA_URL);

	const { title, type } = React.useMemo(() => {
		const type = query?.type?.toString() || null;
		const title = !type || type === 'recent' ? 'recent' : `${type}s`;

		return {
			title,
			type,
		};
	}, [query]);

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

	const { data, isFetching, isLoading, refetch } = useGetManagedFilesQuery(
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
		if (type === null) {
			// i.e. Home/File Dashboard Route
			_files = _files.slice(0, 5);
		} else if (type === 'recent') {
			_files = _files.slice(0, 20);
		} else if (type !== null && ['audio', 'image', 'video'].includes(type)) {
			// audio, image, video
			_files = _files.filter((file) => {
				const fileType = getFileType(file.type, file.url, file.name);
				if (type === fileType) return true;
				return false;
			});
		} else if (type === 'document') {
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

	const accesses = React.useMemo(
		() => [
			{
				bg: 'bg-indigo-500',
				icon: FaFolderOpen,
				link: `${FILE_MANAGER_PAGE_URL}?type=all`,
				onClick: () => setDir(MEDIA_URL),
				title: 'all',
			},
			{
				bg: 'bg-blue-500',
				icon: FaImages,
				link: `${FILE_MANAGER_PAGE_URL}?type=image`,
				title: 'images',
			},
			{
				bg: 'bg-purple-500',
				icon: FaMusic,
				link: `${FILE_MANAGER_PAGE_URL}?type=audio`,
				title: 'audios',
			},
			{
				bg: 'bg-green-500',
				icon: FaVideo,
				link: `${FILE_MANAGER_PAGE_URL}?type=video`,
				title: 'videos',
			},
			{
				bg: 'bg-yellow-500',
				icon: FaFile,
				link: `${FILE_MANAGER_PAGE_URL}?type=document`,
				title: 'documents',
			},
			{
				bg: 'bg-sky-500',
				icon: FaClock,
				link: `${FILE_MANAGER_PAGE_URL}?type=recent`,
				title: 'recent',
			},
		],
		[]
	);

	return (
		<Container
			background="bg-white"
			disabledLoading={isLoading}
			heading="File Manager"
			refresh={{
				loading: isFetching,
				onClick: refetch,
			}}
			error={!canView && !canCreate ? { statusCode: 403 } : undefined}
		>
			{type !== null && (
				<div className="flex flex-col my-4 sm:flex-row sm:justify-between">
					<div className="flex flex-col sm:flex-row">
						<div
							onClick={() => push(FILE_MANAGER_PAGE_URL)}
							className="cursor-pointer duration-500 flex h-[20px] w-[20px] items-center justify-center rounded-full text-gray-700 transform transition-all hover:bg-gray-200 hover:scale-105 hover:text-gray-600 md:h-[30px] md:w-[30px]"
						>
							<FaLongArrowAltLeft className="h-[10px] w-[10px] md:h-[15px] md:w-[15px]" />
						</div>
						{type === 'all' && (
							<div className="relative sm:bottom-[0.8rem] sm:ml-4 md:bottom-[0.5rem] lg:bottom-[0.65rem]">
								<Breadcrumbs dir={dir} setDir={setDir} />
							</div>
						)}
					</div>
					{type === 'all' && (
						<div className="flex items-center justify-between my-1 w-[10rem] sm:bottom-[0.8rem] sm:my-0 sm:relative md:bottom-[0.5rem] lg:bottom-[0.65rem]">
							<FileAction title="File" icon={FaPlus} />
							<FileAction title="Folder" icon={FaFolderPlus} />
							<FileAction
								border="border-red-500"
								color="text-red-500"
								title="Delete"
								icon={FaFolderMinus}
							/>
						</div>
					)}
				</div>
			)}

			{type === null && (
				<>
					<div className="my-2 md:my-4">
						<BoxTitle title="quick actions" />
						<BoxGrid actions={actions} />
					</div>
					<div className="my-2 md:my-4">
						<BoxTitle title="quick access" />
						<BoxGrid actions={accesses} />
					</div>
				</>
			)}

			{type === 'all' ? (
				data?.result && data?.result?.length <= 0 ? (
					<FileEmpty />
				) : (
					<Files data={data?.result || []} dir={dir} setDir={setDir} />
				)
			) : (
				<div className="my-2 md:my-4">
					<h3 className="capitalize my-3 py-2 text-gray-700 text-lg md:text-xl lg:text-2xl">
						{title}
					</h3>
					<div className="bg-gray-200 h-[1px] my-5 w-full">
						<div className="bg-primary-500 h-[1px] w-1/5" />
					</div>
					<div className="my-3 py-2">
						{files.length <= 0 ? <FileEmpty /> : <FileTable files={files} />}
					</div>
				</div>
			)}
		</Container>
	);
}

export default FileManager;
