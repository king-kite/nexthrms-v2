import { Table, TableHeadType, TableRowType } from '@king-kite/react-kit';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaEye } from 'react-icons/fa';

import { OVERTIME_DETAIL_PAGE_URL } from '../../config/routes';
import { OvertimeType } from '../../types';
import { getDate } from '../../utils';

const heads: TableHeadType = [
	{ value: 'type' },
	{ value: 'date' },
	{ value: 'hours' },
	{ value: 'status' },
	{ value: 'last update' },
	{ type: 'actions', value: 'view' },
];

const getRows = (data: OvertimeType[]): TableRowType[] =>
	data.map((item) => ({
		id: item.id,
		rows: [
			{
				link: OVERTIME_DETAIL_PAGE_URL(item.id),
				value: item.type,
			},
			{ value: getDate(item.date, true) },
			{ value: item.hours },
			{
				options: {
					bg:
						item.status === 'APPROVED'
							? 'success'
							: item.status === 'DENIED'
							? 'error'
							: item.status === 'EXPIRED'
							? 'info'
							: 'warning',
				},
				type: 'badge',
				value: item.status,
			},
			{
				value: item.updatedAt ? getDate(item.updatedAt, true) : '---',
			},
			{
				type: 'actions',
				value: [
					{
						color: 'primary',
						icon: FaEye,
						link: OVERTIME_DETAIL_PAGE_URL(item.id),
					},
				],
			},
		],
	}));

type TableType = {
	overtime: OvertimeType[];
};

const OvertimeTable = ({ overtime }: TableType) => {
	const [rows, setRows] = useState<TableRowType[]>([]);
	const [activeRow, setActiveRow] = useState<
		'all' | 'approved' | 'denied' | 'pending'
	>('all');

	useEffect(() => {
		let finalList;
		if (activeRow === 'denied') {
			finalList = overtime.filter((item) => item.status === 'DENIED');
		} else if (activeRow === 'approved') {
			finalList = overtime.filter((item) => item.status === 'APPROVED');
		} else if (activeRow === 'pending') {
			finalList = overtime.filter((item) => item.status === 'PENDING');
		} else {
			finalList = overtime;
		}
		setRows(getRows(finalList));
	}, [activeRow, overtime]);

	return (
		<div className="mt-4 rounded-lg py-2 md:py-3 lg:py-4">
			<Table
				heads={heads}
				rows={rows}
				renderActionLinkAs={({ link, props, children }) => (
					<Link href={link}>
						<a className={props.className} style={props.style}>
							{children}
						</a>
					</Link>
				)}
				renderContainerLinkAs={(props) => (
					<Link href={props.link}>
						<a className={props.className}>{props.children}</a>
					</Link>
				)}
				split={{
					actions: [
						{
							active: activeRow === 'all',
							onClick: () => setActiveRow('all'),
							title: 'all',
						},
						{
							active: activeRow === 'approved',
							onClick: () => setActiveRow('approved'),
							title: 'approved',
						},
						{
							active: activeRow === 'denied',
							onClick: () => setActiveRow('denied'),
							title: 'denied',
						},
						{
							active: activeRow === 'pending',
							onClick: () => setActiveRow('pending'),
							title: 'pending',
						},
					],
				}}
			/>
		</div>
	);
};

export default OvertimeTable;
