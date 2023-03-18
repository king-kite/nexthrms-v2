import { Table, TableHeadType, TableRowType } from 'kite-react-tailwind';
import Link from 'next/link';
import React from 'react';
import { FaCheckCircle, FaEye, FaTimesCircle } from 'react-icons/fa';

import { GROUP_PAGE_URL } from '../../config';
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
			{
				link: GROUP_PAGE_URL(group.id),
				value: toCapitalize(group.name),
			},
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
						link: GROUP_PAGE_URL(group.id),
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
			<Table
				heads={heads}
				rows={rows}
				renderActionLinkAs={({ link, children, ...props }) => (
					<Link href={link}>
						<a {...props}>{children}</a>
					</Link>
				)}
				renderContainerLinkAs={(props) => (
					<Link href={props.link}>
						<a className={props.className}>{props.children}</a>
					</Link>
				)}
			/>
		</div>
	);
};

export default GroupTable;
