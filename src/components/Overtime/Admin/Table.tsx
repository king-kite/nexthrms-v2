import { Table, TableHeadType, TableRowType } from 'kite-react-tailwind';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaEye } from 'react-icons/fa';

import { ADMIN_OVERTIME_DETAIL_PAGE_URL } from '../../../config/routes';
import { OvertimeType } from '../../../types';
import { getDate, serializeOvertime } from '../../../utils';

const heads: TableHeadType = [
	{ value: 'employee name' },
	{ value: 'type' },
	{ value: 'date' },
	{ value: 'hours' },
	{ value: 'status' },
	{ value: 'last update' },
	{ type: 'actions', value: 'view' },
];

const getRows = (data: OvertimeType[]): TableRowType[] =>
	data.map((overtime) => {
		const item = serializeOvertime(overtime);
		return {
			id: item.id,
			rows: [
				{
					link: ADMIN_OVERTIME_DETAIL_PAGE_URL(item.id),
					value:
						item.employee.user.firstName + ' ' + item.employee.user.lastName,
				},
				{
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
								: item.expired
								? 'info'
								: 'warning',
					},
					type: 'badge',
					value:
						item.status === 'PENDING' && item.expired ? 'EXPIRED' : item.status,
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
							link: ADMIN_OVERTIME_DETAIL_PAGE_URL(item.id),
						},
					],
				},
			],
		};
	});

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
		</div>
	);
};

export default OvertimeTable;
