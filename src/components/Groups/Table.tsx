import { Table, TableHeadType, TableRowType } from 'kite-react-tailwind';
import React from 'react';
import { FaCheckCircle, FaEye, FaTimesCircle } from 'react-icons/fa';

import { GroupType } from '../../types';
import { toCapitalize } from '../../utils';

const heads: TableHeadType = [
	{ value: 'name' },
	{ value: 'description' },
	{ value: 'active' },
	{ value: 'actions' },
];

const getRows = (data: GroupType[]): TableRowType[] =>
	data.map((group) => ({
		id: group.id,
		rows: [
			{ value: toCapitalize(group.name) || '---' },
			{ value: group.description || '---' },
			{
				options: {
					className: `${
						group.active ? 'text-green-600' : 'text-red-600'
					} text-sm md:text-base`,
				},
				type: 'icon',
				icon: group.active ? FaCheckCircle : FaTimesCircle,
			},
			{
				type: 'actions',
				value: [
					{
						color: 'primary',
						icon: FaEye,
					},
				],
			},
		],
	}));

type TableType = {
	groups: GroupType[];
};

const GroupTable = ({ groups = [] }: TableType) => {
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

export default GroupTable;
