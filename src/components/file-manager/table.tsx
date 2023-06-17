import { Table, TableHeadType, TableRowType } from 'kite-react-tailwind';
import Link from 'next/link';
import React from 'react';
import { IconType } from 'react-icons';
import { FaArrowRight, FaTrash } from 'react-icons/fa';

import { getIcon, getFileType, getExtension } from './file';
import { TableIconNameSizeCell, TableAvatarEmailNameCell } from '../common';
import { permissions, DEFAULT_IMAGE, USER_PAGE_URL } from '../../config';
import { useAuthContext } from '../../store/contexts';
import {
	useDeleteManagedFileMutation,
	useDeleteMultipleManagedFileMutation,
} from '../../store/queries';
import { ManagedFileType } from '../../types';
import { getStringDateTime, hasModelPermission } from '../../utils';

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
		style,
		value: 'modified',
	},
	{
		style,
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
	}: {
		deleteFile?: (id: string) => void;
	}
): TableRowType[] =>
	data.map((file) => {
		const actions: {
			color: string;
			icon: IconType;
			onClick?: () => void;
		}[] = [
			{
				color: 'primary',
				icon: FaArrowRight,
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
						const extension =
							getExtension(file.url) || getExtension(file.name) || null;
						const name = extension ? `${file.name}.${extension}` : file.name;

						return (
							<span className="cursor-pointer inline-block px-4 w-full hover:bg-gray-100 hover:even:bg-gray-300">
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
						bg: 'success',
					},
					type: 'badge',
					value: 'profile',
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

	const { data: authData } = useAuthContext();

	const { deleteFile } = useDeleteManagedFileMutation();

	const { deleteFiles } = useDeleteMultipleManagedFileMutation({
		type: 'file',
	});

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
		setRows(getRows(files, { deleteFile: canDelete ? deleteFile : undefined }));
	}, [canDelete, deleteFile, files]);

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
