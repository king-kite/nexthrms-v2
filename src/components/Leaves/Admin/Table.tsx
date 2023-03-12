import { Table, TableHeadType, TableRowType } from 'kite-react-tailwind';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaEye } from 'react-icons/fa';

import { ADMIN_LEAVE_DETAIL_PAGE_URL } from '../../../config/routes';
import { LeaveType } from '../../../types';
import { getDate, getNextDate, getNoOfDays } from '../../../utils';

const heads: TableHeadType = [
	{ value: 'employee name' },
	{ value: 'type' },
	{ value: 'start date' },
	{ value: 'end date' },
	{ value: 'days' },
	{ value: 'resumption' },
	{ value: 'status' },
	{ value: 'date' },
	{ type: 'actions', value: 'view' },
];

const getRows = (data: LeaveType[]): TableRowType[] =>
	data.map((leave) => ({
		id: leave.id,
		rows: [
			{
				link: ADMIN_LEAVE_DETAIL_PAGE_URL(leave.id),
				value:
					leave.employee.user.firstName + ' ' + leave.employee.user.lastName,
			},
			{ value: leave.type },
			{ value: getDate(leave.startDate, true) },
			{ value: getDate(leave.endDate, true) },
			{ value: getNoOfDays(leave.startDate, leave.endDate) },
			{ value: getNextDate(leave.endDate, 1, true) },
			{
				options: {
					bg:
						leave.status === 'APPROVED'
							? 'success'
							: leave.status === 'DENIED'
							? 'error'
							: // : leave.status === 'EXPIRED'
							  // ? 'info'
							  'warning',
				},
				type: 'badge',
				value: leave.status,
			},
			{
				value: leave.updatedAt ? getDate(leave.updatedAt, true) : '---',
			},
			{
				type: 'actions',
				value: [
					{
						color: 'primary',
						icon: FaEye,
						link: ADMIN_LEAVE_DETAIL_PAGE_URL(leave.id),
					},
				],
			},
		],
	}));

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

export default LeaveTable;
