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
import { ImportForm, Modal } from '../common';
import {
	permissions,
	samples,
	FILE_MANAGER_PAGE_URL,
	MANAGED_FILES_IMPORT_URL,
	MEDIA_URL,
} from '../../config';
import { useAlertContext, useAuthContext } from '../../store/contexts';
import { hasModelPermission } from '../../utils';

function Actions({
	openModal,
	setDir,
}: {
	openModal: (type: 'file' | 'folder') => void;
	setDir: React.Dispatch<React.SetStateAction<string>>;
}) {
	const [modalVisible, setModalVisible] = React.useState(false);

	const { open } = useAlertContext();
	const { data: authData } = useAuthContext();

	const { canExport, canImport } = React.useMemo(
		() => ({
			canExport: authData
				? authData.isSuperUser ||
				  (authData.isAdmin &&
						hasModelPermission(authData.permissions, [
							permissions.managedfile.EXPORT,
						]))
				: false,
			canImport: authData
				? authData.isSuperUser ||
				  (authData.isAdmin &&
						hasModelPermission(authData.permissions, [
							permissions.managedfile.CREATE,
						]))
				: false,
		}),
		[authData]
	);

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
				onClick: () => setModalVisible(true),
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
	}, [canImport, canExport, openModal]);
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
			{canImport && (
				<Modal
					close={() => setModalVisible(false)}
					component={
						<ImportForm
							onSuccess={(data) => {
								open({
									type: 'success',
									message: data.message,
								});
								setModalVisible(false);
							}}
							requirements={[
								{
									required: false,
									title: 'id',
									value: 'c2524fca-9182-4455-8367-c7a27abe1b73',
								},
								{
									title: 'name',
									value: 'Image 1',
								},
								{
									title: 'url',
									value: '/images/default.png',
								},
								{
									title: 'size',
									value: '1607',
								},
								{
									title: 'storage_info_keys',
									value: '"public_id,location,name,type"',
								},
								{
									title: 'storage_info_values',
									value: '"c2524fca-9182-4455-8367-c7a27abe1b73,Image 1,file"',
								},
								{
									title: 'type',
									value: 'image',
								},
								{
									required: false,
									title: 'user_id',
									value: 'c2524fca-9182-4455-8367-c7a27abe1b73',
								},
								{
									required: false,
									title: 'updated_at',
									value: '2023-03-26T21:49:51.090Z',
								},
								{
									required: false,
									title: 'created_at',
									value: '2023-03-26T21:49:51.090Z',
								},
							]}
							sample={samples.managedFiles}
							url={MANAGED_FILES_IMPORT_URL}
						/>
					}
					description="Upload file to import multiple files"
					title="Bulk Import Files"
					visible={modalVisible}
				/>
			)}
		</>
	);
}

export default Actions;
