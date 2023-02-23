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
	FaUserFriends,
} from 'react-icons/fa';

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
	groups: ObjPermGroupType[];
};

const GroupPermissionsTable = ({ groups = [] }: TableType) => {
	const [rows, setRows] = React.useState<TableRowType[]>([]);

	React.useEffect(() => {
		setRows(getRows(groups));
	}, [groups]);

	return (
		<div>
			<div className="flex flex-wrap items-center w-full lg:justify-end">
				<div className="my-2 w-full sm:px-2 sm:w-1/3 md:w-1/4">
					<Button
						iconLeft={FaUserFriends}
						rounded="rounded-xl"
						title="Add Groups"
					/>
				</div>
			</div>
			<div className="mt-2 rounded-lg py-2 md:mt-1">
				<Table heads={heads} rows={rows} />
			</div>
		</div>
	);
};

export default GroupPermissionsTable;
