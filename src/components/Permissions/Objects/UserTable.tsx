import {
	Button,
	Table,
	TableHeadType,
	TableRowType,
} from 'kite-react-tailwind';
import React from 'react';
import {
	FaCheckCircle,
	FaPen,
	FaTimesCircle,
	FaTrash,
	FaUserEdit,
} from 'react-icons/fa';

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
				icon: user.delete ? FaCheckCircle : FaTimesCircle,
			},
			{
				type: 'actions',
				value: [
					{
						color: 'primary',
						icon: FaPen,
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
		<div>
			<div className="flex flex-wrap items-center w-full lg:justify-end">
				<div className="my-2 w-full sm:px-2 sm:w-1/3 md:w-1/4">
					<Button
						iconLeft={FaUserEdit}
						rounded="rounded-xl"
						title="Add Users"
					/>
				</div>
			</div>
			<div className="mt-2 rounded-lg py-2 md:mt-1">
				<Table heads={heads} rows={rows} />
			</div>
		</div>
	);
};

export default UserPermissionsTable;
