import { Table, TableHeadType, TableRowType } from 'kite-react-tailwind';
import React from 'react';
import { IconType } from 'react-icons';
import { FaArrowRight, FaTrash } from 'react-icons/fa';

import { getIcon, getFileType, getExtension } from './file';
import { TableIconNameCell, TableAvatarEmailNameCell } from '../common';
import {
	permissions,
	DEFAULT_IMAGE,
	MEDIA_HIDDEN_FILE_NAME,
} from '../../config';
import { useAuthContext } from '../../store/contexts';
import { useDeleteManagedFileMutation } from '../../store/queries';
import { ManagedFileType } from '../../types';
import { getStringedDate, hasModelPermission } from '../../utils';

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
	{ value: 'size' },
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
								<TableIconNameCell bg={color} icon={icon} name={name} />
							</span>
						);
					},
				},
				{ value: file.size },
				{
					value: file.updatedAt ? getStringedDate(file.updatedAt) : '---',
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
						<span className="inline-block px-2 w-full hover:bg-gray-100 hover:even:bg-gray-300">
							<TableAvatarEmailNameCell
								email={file.user ? file.user.email : '-------------'}
								image={file.user?.profile?.image?.url || DEFAULT_IMAGE}
								name={
									file.user
										? `${file.user.firstName} ${file.user.lastName}`
										: 'Anonymous'
								}
							/>
						</span>
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
		const data = files.filter((file) => {
			if (
				file.name.includes(MEDIA_HIDDEN_FILE_NAME) ||
				file.url.includes(MEDIA_HIDDEN_FILE_NAME)
			)
				return false;
			return true;
		});
		// const data = files.filter((file) => file.name !== MEDIA_HIDDEN_FILE_NAME);
		setRows(getRows(data, { deleteFile: canDelete ? deleteFile : undefined }));
	}, [canDelete, deleteFile, files]);

	return <Table heads={heads} rows={rows} sn={false} />;
};

export default FileTable;
