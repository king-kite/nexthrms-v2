import { Table, TableHeadType, TableRowType } from 'kite-react-tailwind';
import React from 'react';
import { FaCheckCircle, FaEye, FaTimesCircle, FaTrash } from 'react-icons/fa';

import { ObjPermUser } from '../../../types';
import { toCapitalize } from '../../../utils';

const heads: TableHeadType = [
	{ value: 'name' },
	{ value: 'email' },
	{ value: 'view' },
	{ value: 'edit' },
	{ value: 'delete' },
	{ type: 'actions', value: 'actions' },
];

const getRows = (data: ObjPermUser[]): TableRowType[] =>
	data.map((user) => ({
		id: user.id,
		rows: [
			{ value: toCapitalize(user.firstName + ' ' + user.lastName) },
			{ value: user.email },
			{
				options: {
					className: `${
						user.view ? 'text-green-600' : 'text-red-600'
					} text-sm md:text-base`,
				},
				type: 'icon',
				icon: user.view ? FaCheckCircle : FaTimesCircle,
			},
			{
				options: {
					className: `${
						user.edit ? 'text-green-600' : 'text-red-600'
					} text-sm md:text-base`,
				},
				type: 'icon',
				icon: user.edit ? FaCheckCircle : FaTimesCircle,
			},
			{
				options: {
					className: `${
						user.delete ? 'text-green-600' : 'text-red-600'
					} text-sm md:text-base`,
				},
				type: 'icon',
				icon: user.edit ? FaCheckCircle : FaTimesCircle,
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
	users: ObjPermUser[];
};

const UserPermissionsTable = ({ users = [] }: TableType) => {
	const [rows, setRows] = React.useState<TableRowType[]>([]);

	React.useEffect(() => {
		setRows(getRows(users));
	}, [users]);

	return (
		<div className="mt-4 rounded-lg py-2 md:py-3 lg:py-4">
			<Table heads={heads} rows={rows} />
		</div>
	);
};

export default UserPermissionsTable;
