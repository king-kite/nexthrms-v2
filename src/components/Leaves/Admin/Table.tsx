import { Table, TableHeadType, TableRowType } from '@king-kite/react-kit';
import Link from 'next/link'
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
							: leave.status === 'EXPIRED'
							? 'info'
							: 'warning',
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
	setStatus: (e: '' | 'approved' | 'denied' | 'pending') => void;
};

const LeaveTable = ({ leaves, setStatus }: TableType) => {
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
		<div className="mt-4 rounded-lg p-2 md:p-3 lg:p-4">
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
				split={{
					actions: [
						{
							active: activeRow === 'all',
							onClick: () => {
								setRows(getRows(leaves));
								setActiveRow('all');
								setStatus('');
							},
							title: 'all',
						},
						{
							active: activeRow === 'approved',
							onClick: () => {
								setActiveRow('approved');
								setStatus('approved');
							},
							title: 'approved',
						},
						{
							active: activeRow === 'denied',
							onClick: () => {
								setActiveRow('denied');
								setStatus('denied');
							},
							title: 'denied',
						},
						{
							active: activeRow === 'pending',
							onClick: () => {
								setActiveRow('pending');
								setStatus('pending');
							},
							title: 'pending',
						},
					],
				}}
			/>
		</div>
	);
};

export default LeaveTable;
