import { useRouter } from 'next/router';
import React from 'react';
import {
	FaFolderMinus,
	FaFolderPlus,
	FaLongArrowAltLeft,
	FaPlus,
} from 'react-icons/fa';

import Breadcrumbs from './breadcrumbs';
import { FileAction } from './file';
import { FILE_MANAGER_PAGE_URL } from '../../config';
import { useDeleteMultipleManagedFileMutation } from '../../store/queries';

function FileActions({
	dir,
	openModal,
	setDir,
	showAction,
	uploadDir,
}: {
	dir: string;
	openModal: (type: 'file' | 'folder') => void;
	setDir: React.Dispatch<React.SetStateAction<string>>;
	showAction: boolean;
	uploadDir: string;
}) {
	const { push } = useRouter();

	const { deleteFiles } = useDeleteMultipleManagedFileMutation({
		type: 'folder',
	});

	return (
		<div className="flex flex-col my-4 sm:flex-row sm:justify-between">
			<div className="flex flex-col sm:flex-row">
				<div
					onClick={() => push(FILE_MANAGER_PAGE_URL)}
					className="cursor-pointer duration-500 flex h-[20px] w-[20px] items-center justify-center rounded-full text-gray-700 transform transition-all hover:bg-gray-200 hover:scale-105 hover:text-gray-600 md:h-[30px] md:w-[30px]"
				>
					<FaLongArrowAltLeft className="h-[10px] w-[10px] md:h-[15px] md:w-[15px]" />
				</div>
				{showAction && (
					<div className="relative sm:bottom-[0.8rem] sm:ml-4 md:bottom-[0.5rem]">
						<Breadcrumbs dir={dir} setDir={setDir} />
					</div>
				)}
			</div>
			{showAction && (
				<div className="flex items-center justify-between my-1 w-[10rem] sm:bottom-[0.8rem] sm:my-0 sm:relative md:bottom-[0.5rem] lg:bottom-[0.65rem]">
					<FileAction
						onClick={() => openModal('file')}
						title="File"
						icon={FaPlus}
					/>
					<FileAction
						onClick={() => openModal('folder')}
						title="Folder"
						icon={FaFolderPlus}
					/>
					<FileAction
						border="border-red-500"
						color="text-red-500"
						title="Delete"
						onClick={() => deleteFiles({ folder: uploadDir })}
						icon={FaFolderMinus}
					/>
				</div>
			)}
		</div>
	);
}

export default FileActions;
