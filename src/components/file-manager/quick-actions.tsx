import React from 'react';
import {
	FaCloudDownloadAlt,
	FaCloudUploadAlt,
	FaFile,
	FaFolderOpen,
	FaFolderPlus,
	FaImages,
	FaPlus,
	FaMusic,
	FaServer,
	FaVideo,
} from 'react-icons/fa';

import { BoxGrid, BoxTitle } from './box-items';
import { permissions, FILE_MANAGER_PAGE_URL, MEDIA_URL } from '../../config';
import { useAuthContext } from '../../store/contexts';
import { hasModelPermission } from '../../utils';

function Actions({
	openModal,
	setDir,
}: {
	openModal: (type: 'file' | 'folder') => void;
	setDir: React.Dispatch<React.SetStateAction<string>>;
}) {
	const { data: authData } = useAuthContext();

	const accesses = React.useMemo(
		() => [
			{
				bg: 'bg-indigo-500',
				icon: FaFolderOpen,
				link: `${FILE_MANAGER_PAGE_URL}?type=all`,
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
				icon: FaServer,
				link: `${FILE_MANAGER_PAGE_URL}?type=storage`,
				onClick: () => setDir(MEDIA_URL),
				title: 'storage',
			},
		],
		[setDir]
	);
	const actions = React.useMemo(() => {
		const canExport = authData
			? authData.isSuperUser ||
			  (authData.isAdmin &&
					hasModelPermission(authData.permissions, [
						permissions.managedfile.EXPORT,
					]))
			: false;
		const canImport = authData
			? authData.isSuperUser ||
			  (authData.isAdmin &&
					hasModelPermission(authData.permissions, [
						permissions.managedfile.CREATE,
					]))
			: false;

		const data = [
			{
				bg: 'bg-gray-500',
				icon: FaPlus,
				onClick: () => openModal('file'),
				title: 'New File',
			},
			{
				bg: 'bg-gray-500',
				icon: FaFolderPlus,
				onClick: () => openModal('folder'),
				title: 'New Folder',
			},
		];
		if (canImport)
			data.push({
				bg: 'bg-violet-500',
				icon: FaCloudUploadAlt,
				onClick: () => {},
				title: 'Import',
			});

		if (canExport)
			data.push({
				bg: 'bg-sky-500',
				icon: FaCloudDownloadAlt,
				onClick: () => {},
				title: 'Export',
			});

		return data;
	}, [authData, openModal]);
	return (
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
	);
}

export default Actions;