import { Table, TableHeadType, TableRowType } from 'kite-react-tailwind';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaArrowRight } from 'react-icons/fa';

import { LEAVE_DETAIL_PAGE_URL } from '../../config/routes';
import { LeaveType } from '../../types';
import { getDate, getNextDate, getNoOfDays, serializeLeave } from '../../utils';

const heads: TableHeadType = [
	{ value: 'type' },
	{ value: 'start date' },
	{ value: 'resumption' },
	{ value: 'days' },
	{ value: 'status' },
	{ value: 'date' },
	{ type: 'actions', value: 'view' },
];

const getRows = (data: LeaveType[]): TableRowType[] =>
	data.map((lve) => {
		const leave = serializeLeave(lve);
		return {
			id: leave.id,
			rows: [
				{
					link: LEAVE_DETAIL_PAGE_URL(leave.id),
					value: leave.type,
				},
				{ value: getDate(leave.startDate, true) },
				{ value: getDate(leave.endDate, true) },
				{ value: getNoOfDays(leave.startDate, leave.endDate) },
				{
					options: {
						bg:
							leave.status === 'APPROVED'
								? 'success'
								: leave.status === 'DENIED'
								? 'error'
								: leave.expired
								? 'info'
								: 'warning',
					},
					type: 'badge',
					value:
						leave.status === 'PENDING' && leave.expired
							? 'EXPIRED'
							: leave.status,
				},
				{
					value: leave.updatedAt ? getDate(leave.updatedAt, true) : '---',
				},
				{
					type: 'actions',
					value: [
						{
							color: 'primary',
							icon: FaArrowRight,
							link: LEAVE_DETAIL_PAGE_URL(leave.id),
						},
					],
				},
			],
		};
	});

type TableType = {
	leaves: LeaveType[];
};

const LeaveTable = ({ leaves }: TableType) => {
	const [rows, setRows] = useState<TableRowType[]>([]);
	const [activeRow, setActiveRow] = useState<
		'all' | 'approved' | 'denied' | 'pending'
	>('all');

	useEffect(() => {
		let finalList;
		if (activeRow === 'denied') {
			finalList = leaves.filter((leave) => leave.status === 'DENIED');
		} else if (activeRow === 'approved') {
			finalList = leaves.filter((leave) => leave.status === 'APPROVED');
		} else if (activeRow === 'pending') {
			finalList = leaves.filter((leave) => leave.status === 'PENDING');
		} else {
			finalList = leaves;
		}
		setRows(getRows(finalList));
	}, [activeRow, leaves]);

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
	);
};

export default LeaveTable;
