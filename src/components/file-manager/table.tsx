import { Table, TableHeadType, TableRowType } from 'kite-react-tailwind';
import { useEffect, useState } from 'react';
import { FaArrowRight } from 'react-icons/fa';

import { getIcon, getFileType, getExtension } from './file';
import { TableIconNameCell, TableAvatarEmailNameCell } from '../common';
import { DEFAULT_IMAGE, MEDIA_HIDDEN_FILE_NAME } from '../../config';
import { ManagedFileType } from '../../types';
import { getStringedDate } from '../../utils';

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

const getRows = (data: ManagedFileType[]): TableRowType[] =>
	data.map((file) => ({
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
				value: [
					{
						color: 'primary',
						icon: FaArrowRight,
					},
				],
			},
		],
	}));

type TableType = {
	files: ManagedFileType[];
};

const FileTable = ({ files }: TableType) => {
	const [rows, setRows] = useState<TableRowType[]>([]);

	useEffect(() => {
		const data = files.filter((file) => {
			if (
				file.name.includes(MEDIA_HIDDEN_FILE_NAME) ||
				file.url.includes(MEDIA_HIDDEN_FILE_NAME)
			)
				return false;
			return true;
		});
		// const data = files.filter((file) => file.name !== MEDIA_HIDDEN_FILE_NAME);
		setRows(getRows(data));
	}, [files]);

	return <Table heads={heads} rows={rows} sn={false} />;
};

export default FileTable;
