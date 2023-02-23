import { Table, TableHeadType, TableRowType } from 'kite-react-tailwind';
import React from 'react';
import { FaCheckCircle, FaEye, FaTimesCircle, FaTrash } from 'react-icons/fa';

import { ObjPermGroupType } from '../../../types';

const heads: TableHeadType = [
	{ value: 'name' },
	{ value: 'view' },
	{ value: 'edit' },
	{ value: 'delete' },
	{ type: 'actions', value: 'actions' },
];

const getRows = (data: ObjPermGroupType[]): TableRowType[] =>
	data.map((group) => ({
		id: group.id,
		rows: [
			{ value: group.name },
			{
				options: {
					className: `${
						group.view ? 'text-green-600' : 'text-red-600'
					} text-sm md:text-base`,
				},
				type: 'icon',
				icon: group.view ? FaCheckCircle : FaTimesCircle,
			},
			{
				options: {
					className: `${
						group.edit ? 'text-green-600' : 'text-red-600'
					} text-sm md:text-base`,
				},
				type: 'icon',
				icon: group.edit ? FaCheckCircle : FaTimesCircle,
			},
			{
				options: {
					className: `${
						group.delete ? 'text-green-600' : 'text-red-600'
					} text-sm md:text-base`,
				},
				type: 'icon',
				icon: group.delete ? FaCheckCircle : FaTimesCircle,
			},
			{
				type: 'actions',
				value: [
					{
						color: 'primary',
						icon: FaEye,
					},
					{
						color: 'danger',
						icon: FaTrash,
					},
				],
			},
		],
	}));

type TableType = {
	groups: ObjPermGroupType[];
};

const GroupPermissionsTable = ({ groups = [] }: TableType) => {
	const [rows, setRows] = React.useState<TableRowType[]>([]);

	React.useEffect(() => {
		setRows(getRows(groups));
	}, [groups]);

	return (
		<div className="mt-4 rounded-lg py-2 md:py-3 lg:py-4">
			<Table heads={heads} rows={rows} />
		</div>
	);
};

export default GroupPermissionsTable;
