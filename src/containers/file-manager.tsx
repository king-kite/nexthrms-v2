import React from 'react';
import {
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
	FileTable,
	Files,
	Topbar,
} from '../components/file-manager';
import { permissions, DEFAULT_PAGINATION_SIZE, MEDIA_URL } from '../config';
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

	const actions = [
		{
			bg: 'bg-gray-500',
			icon: FaPlus,
			title: 'New File'
		},
		{
			bg: 'bg-gray-500',
			icon: FaFolderPlus,
			title: 'New Folder'
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
	]

	const accesses = [
		{
			bg: 'bg-indigo-500',
			icon: FaFolderOpen,
			title: 'all'
		},
		{
			bg: 'bg-blue-500',
			icon: FaImages,
			title: 'images',
		},
		{
			bg: 'bg-purple-500',
			icon: FaMusic,
			title: 'audios',
		},
		{
			bg: 'bg-green-500',
			icon: FaVideo,
			title: 'videos',
		},
		{
			bg: 'bg-yellow-500',
			icon: FaFile,
			title: 'documents',
		},
	];

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
				<h3 className="capitalize my-3 py-2 text-gray-700 text-lg md:text-xl lg:text-2xl">
					quick actions
				</h3>
				<div className="bg-gray-200 h-[1px] my-5 w-full">
					<div className="bg-primary-500 h-[1px] w-1/5" />
				</div>
				<div className="gap-4 grid grid-cols-2 my-3 py-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
					{actions.map(({ bg, icon: Icon, title }, index) => (
						<div
							key={index}
							className="cursor-pointer transition transform hover:scale-105"
						>
							<div className="bg-white border border-gray-200 flex justify-center p-4 rounded-md hover:bg-gray-50">
								<span
									className={`${bg} h-[60px] inline-flex items-center justify-center rounded-full text-primary-700 w-[60px]`}
								>
									<Icon className="h-[20px] text-gray-50 w-[20px]" />
								</span>
							</div>
							<p className="capitalize my-2 text-center text-gray-700 text-sm tracking-wide md:text-base">
								{title}
							</p>
						</div>
					))}
				</div>
			</div>

			<div className="my-2 md:my-4">
				<h3 className="capitalize my-3 py-2 text-gray-700 text-lg md:text-xl lg:text-2xl">
					quick access
				</h3>
				<div className="bg-gray-200 h-[1px] my-5 w-full">
					<div className="bg-primary-500 h-[1px] w-1/5" />
				</div>
				<div className="gap-4 grid grid-cols-2 my-3 py-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
					{accesses.map(({ bg, icon: Icon, title }, index) => (
						<div
							key={index}
							className="cursor-pointer transition transform hover:scale-105"
						>
							<div className="bg-white border border-gray-200 flex justify-center p-4 rounded-md hover:bg-gray-50">
								<span
									className={`${bg} h-[60px] inline-flex items-center justify-center rounded-full text-primary-700 w-[60px]`}
								>
									<Icon className="h-[20px] text-gray-50 w-[20px]" />
								</span>
							</div>
							<p className="capitalize my-2 text-center text-gray-700 text-sm tracking-wide md:text-base">
								{title}
							</p>
						</div>
					))}
				</div>
			</div>

			<div className="my-2 md:my-4">
				<h3 className="capitalize my-3 py-2 text-gray-700 text-lg md:text-xl lg:text-2xl">
					Recent Files
				</h3>
				<div className="bg-gray-200 h-[1px] my-5 w-full">
					<div className="bg-primary-500 h-[1px] w-1/5" />
				</div>
				<div className="my-3 py-2">
					<FileTable files={data?.result || []} />
				</div>
			</div>

			<Breadcrumbs dir={dir} setDir={setDir} />
			{canCreate && <Topbar />}
			{data?.result && <Files data={data.result} dir={dir} setDir={setDir} />}
		</Container>
	);
}

export default FileManager;
