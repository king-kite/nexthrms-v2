import { Table, TableHeadType, TableRowType } from 'kite-react-tailwind';
import Link from 'next/link';
import React from 'react';
import { IconType } from 'react-icons';
import { FaDownload, FaEye, FaTrash } from 'react-icons/fa';

import { getIcon, getFileType, getExtension } from './file';
import { TableIconNameSizeCell, TableAvatarEmailNameCell } from '../common';
import { permissions, DEFAULT_IMAGE, USER_PAGE_URL } from '../../config';
import { useFileDetailContext } from '../../containers/file-manager';
import { useAlertContext, useAuthContext } from '../../store/contexts';
import {
	useDeleteManagedFileMutation,
	useDeleteMultipleManagedFileMutation,
} from '../../store/queries';
import { ManagedFileType } from '../../types';
import {
	downloadFile,
	getStringDateTime,
	hasModelPermission,
} from '../../utils';

const style = {
	paddingLeft: '1rem',
	paddingRight: '1rem',
};

const heads: TableHeadType = [
	{
		style: {
			// marginLeft: '3.5rem',
			// minWidth: '70px',
			paddingLeft: '0.5rem',
			paddingRight: '0.5rem',
			textAlign: 'left',
		},
		value: 'name',
	},
	{
		style: {
			...style,
			minWidth: '140px',
		},
		value: 'modified',
	},
	{
		style: {
			paddingLeft: '1.5rem',
			paddingRight: '1.5rem',
		},
		value: 'label',
	},
	{
		value: 'user',
	},
	{ type: 'actions', value: 'view' },
];

const getRows = (
	data: ManagedFileType[],
	{
		deleteFile,
		download,
		showDetail,
	}: {
		deleteFile?: (id: string) => void;
		download: (url: string, name: string) => void;
		showDetail: (file: ManagedFileType) => void | null;
	}
): TableRowType[] =>
	data.map((file) => {
		const extension = getExtension(file.url) || getExtension(file.name) || null;
		const name = extension ? `${file.name}.${extension}` : file.name;

		const actions: {
			color: string;
			icon: IconType;
			onClick?: () => void;
		}[] = [
			{
				color: 'primary',
				icon: FaEye,
				onClick: showDetail ? () => showDetail(file) : undefined,
			},
			{
				color: 'success',
				icon: FaDownload,
				onClick: () => download(file.url, name),
			},
		];

		if (deleteFile) {
			actions.push({
				color: 'danger',
				icon: FaTrash,
				onClick: () => deleteFile(file.id),
			});
		}

		return {
			id: file.id,
			rows: [
				{
					component: () => {
						const icon = getIcon(file.type, file.url, file.name);
						const fileType = getFileType(file.type, file.url, file.name);
						const color =
							fileType === 'image'
								? 'bg-blue-500'
								: fileType === 'audio'
								? 'bg-purple-500'
								: fileType === 'video'
								? 'bg-green-500'
								: fileType === 'word'
								? 'bg-blue-600'
								: fileType === 'excel'
								? 'bg-green-600'
								: fileType === 'zip'
								? 'bg-yellow-700'
								: fileType === 'pdf'
								? 'bg-red-500'
								: 'bg-gray-500';
						return (
							<span
								className="cursor-pointer inline-block px-4 w-full hover:bg-gray-100 hover:even:bg-gray-300"
								onClick={showDetail ? () => showDetail(file) : undefined}
							>
								<TableIconNameSizeCell
									bg={color}
									icon={icon}
									name={name}
									size={file.size || '-----'}
								/>
							</span>
						);
					},
				},
				{
					component: file.updatedAt
						? () => (
								<span className="normal-case">
									{getStringDateTime(file.updatedAt)}
								</span>
						  )
						: undefined,
					value: !file.updatedAt ? '---' : undefined,
				},
				{
					options: {
						bg: file.projectFile
							? 'warning'
							: file.profile
							? 'success'
							: 'info',
					},
					type: file.projectFile || file.profile ? 'badge' : undefined,
					value: file.projectFile
						? 'project'
						: file.profile
						? 'profile'
						: '-----',
				},
				{
					component: () => (
						<Link href={file.user ? USER_PAGE_URL(file.user.id) : '#'}>
							<a className="cursor-pointer inline-block px-2 w-full hover:bg-gray-100 hover:even:bg-gray-300">
								<TableAvatarEmailNameCell
									email={file.user ? file.user.email : '-------------'}
									image={file.user?.profile?.image?.url || DEFAULT_IMAGE}
									name={
										file.user
											? `${file.user.firstName} ${file.user.lastName}`
											: 'Anonymous'
									}
								/>
							</a>
						</Link>
					),
				},
				{
					type: 'actions',
					value: actions,
				},
			],
		};
	});

type TableType = {
	files: ManagedFileType[];
};

const FileTable = ({ files }: TableType) => {
	const [rows, setRows] = React.useState<TableRowType[]>([]);

	const { open } = useAlertContext();
	const { data: authData } = useAuthContext();

	const { showDetail } = useFileDetailContext();

	const { deleteFile } = useDeleteManagedFileMutation();

	const { deleteFiles } = useDeleteMultipleManagedFileMutation({
		type: 'file',
	});

	const download = React.useCallback(
		async (url: string, name: string) => {
			const data = await downloadFile({ name, url });
			if (data !== undefined && data.status !== 200) {
				open({
					type: 'danger',
					message: String(
						data.data?.message || data.data || 'Unable to download file'
					),
				});
			}
		},
		[open]
	);

	const [canDelete] = React.useMemo(() => {
		if (!authData) return [false];
		const canDelete =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [
				permissions.managedfile.DELETE,
			]);
		return [canDelete];
	}, [authData]);

	React.useEffect(() => {
		// const data = files.filter((file) => file.name !== MEDIA_HIDDEN_FILE_NAME);
		setRows(
			getRows(files, {
				deleteFile: canDelete ? deleteFile : undefined,
				download,
				showDetail,
			})
		);
	}, [canDelete, deleteFile, download, files, showDetail]);

	return (
		<Table
			actions={{
				actions: [
					{
						title: 'Delete selected files',
						value: 'delete_selected',
						onSubmit: (files) => deleteFiles({ files }),
					},
				],
			}}
			heads={heads}
			rows={rows}
			sn={false}
			tick
		/>
	);
};

export default FileTable;
