import { Table, TableHeadType, TableRowType } from 'kite-react-tailwind';
import Link from 'next/link';
import React from 'react';
import { FaArrowRight, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

import { GROUP_PAGE_URL } from '../../config';
import { GroupType } from '../../types';
import { toCapitalize } from '../../utils';

const heads: TableHeadType = [
	{ value: 'name' },
	{ value: 'description' },
	{ value: 'active' },
	{ type: 'actions', value: 'view' },
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
						icon: FaArrowRight,
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
	const deferredValue = React.useDeferredValue(groups);
	const rows = React.useMemo(() => getRows(deferredValue), [deferredValue]);

	return (
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
	);
};

export default GroupTable;
