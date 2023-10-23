import { Table, TableHeadType, TableRowType } from 'kite-react-tailwind';
import Link from 'next/link';
import React from 'react';
import { FaArrowRight } from 'react-icons/fa';

import { TableAvatarEmailNameCell } from '../../common';
import { ADMIN_LEAVE_DETAIL_PAGE_URL } from '../../../config/routes';
import { DEFAULT_IMAGE } from '../../../config/static';
import { LeaveType } from '../../../types';
import { getDate, getMediaUrl, getNoOfDays, serializeLeave } from '../../../utils';

const heads: TableHeadType = [
	{
		style: {
			marginLeft: '3.5rem',
			minWidth: '70px',
			textAlign: 'left',
		},
		value: 'employee',
	},
	{ value: 'type' },
	{ value: 'start date' },
	{ value: 'resumption' },
	{ value: 'days' },
	{ value: 'status' },
	{ value: 'updated' },
	{ type: 'actions', value: 'view' },
];

const getRows = (data: LeaveType[]): TableRowType[] =>
	data.map((lve) => {
		const leave = serializeLeave(lve);
		return {
			id: leave.id,
			rows: [
				{
					component: () => (
						<Link href={ADMIN_LEAVE_DETAIL_PAGE_URL(leave.id)}>
							<a className="inline-block w-full hover:bg-gray-100 hover:even:bg-gray-300">
								<TableAvatarEmailNameCell
									email={leave.employee.user.email}
									image={
										leave.employee.user.profile?.image
											? getMediaUrl(leave.employee.user.profile.image)
											: DEFAULT_IMAGE
									}
									name={`${leave.employee.user.firstName} ${leave.employee.user.lastName}`}
								/>
							</a>
						</Link>
					),
				},
				{ value: leave.type },
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
					value: leave.status === 'PENDING' && leave.expired ? 'EXPIRED' : leave.status,
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
							link: ADMIN_LEAVE_DETAIL_PAGE_URL(leave.id),
						},
					],
				},
			],
		};
	});

type TableType = {
	leaves: LeaveType[];
	offset?: number;
};

const LeaveTable = ({ leaves, offset = 0 }: TableType) => {
	const [activeRow, setActiveRow] = React.useState<'all' | 'approved' | 'denied' | 'pending'>(
		'all'
	);

	const { leaves: deferredValue, offset: deferredOffset } = React.useDeferredValue({
		leaves,
		offset,
	});
	const rows = React.useMemo(() => {
		let finalList;
		if (activeRow === 'denied') {
			finalList = deferredValue.filter((leave) => leave.status === 'DENIED');
		} else if (activeRow === 'approved') {
			finalList = deferredValue.filter((leave) => leave.status === 'APPROVED');
		} else if (activeRow === 'pending') {
			finalList = deferredValue.filter((leave) => leave.status === 'PENDING');
		} else {
			finalList = deferredValue;
		}
		return getRows(finalList);
	}, [activeRow, deferredValue]);

	return (
		<Table
			heads={heads}
			rows={rows}
			sn={deferredOffset}
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
