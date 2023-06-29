import { Table, TableHeadType, TableRowType } from 'kite-react-tailwind';
import Link from 'next/link';
import React from 'react';
import { FaArrowRight } from 'react-icons/fa';

import { TableAvatarEmailNameCell } from '../common';
import { EMPLOYEE_PAGE_URL } from '../../config/routes';
import { DEFAULT_IMAGE } from '../../config/static';
import { EmployeeType } from '../../types';
import { getStringedDate } from '../../utils';

const heads: TableHeadType = [
	{
		style: {
			marginLeft: '3.5rem',
			minWidth: '70px',
			textAlign: 'left',
		},
		value: 'employee',
	},
	{ value: 'department' },
	{ value: 'status' },
	{ value: 'date employed' },
	{ type: 'actions', value: 'view' },
];

const getRows = (data: EmployeeType[]): TableRowType[] =>
	data.map((employee) => ({
		id: employee.id,
		rows: [
			{
				component: () => (
					<Link href={EMPLOYEE_PAGE_URL(employee.id)}>
						<a className="inline-block w-full hover:bg-gray-100 hover:even:bg-gray-300">
							<TableAvatarEmailNameCell
								email={employee.user.email}
								image={employee.user.profile?.image?.url || DEFAULT_IMAGE}
								name={`${employee.user.firstName} ${employee.user.lastName}`}
							/>
						</a>
					</Link>
				),
			},
			{ value: employee.department?.name || '---' },
			{
				options: {
					bg:
						employee.leaves.length > 0
							? 'warning'
							: employee.user.isActive
							? 'green'
							: 'danger',
				},
				type: 'badge',
				value:
					employee.leaves.length > 0
						? 'on leave'
						: employee.user.isActive
						? 'active'
						: 'inactive',
			},
			{
				value: employee.dateEmployed
					? getStringedDate(employee.dateEmployed)
					: '---',
			},
			{
				type: 'actions',
				value: [
					{
						color: 'primary',
						icon: FaArrowRight,
						link: EMPLOYEE_PAGE_URL(employee.id),
					},
				],
			},
		],
	}));

type TableType = {
	employees: EmployeeType[];
};

const EmployeeTable = ({ employees }: TableType) => {
	const [activeRow, setActiveRow] = React.useState<
		'all' | 'active' | 'on leave' | 'inactive'
	>('all');

	const deferredValue = React.useDeferredValue(employees);
	const rows = React.useMemo(() => {
		let finalList;
		if (activeRow === 'on leave') {
			finalList = deferredValue.filter(
				(employee) => employee.leaves.length > 0
			);
		} else if (activeRow === 'active') {
			finalList = deferredValue.filter(
				(employee) =>
					employee.user.isActive === true && employee.leaves.length === 0
			);
		} else if (activeRow === 'inactive') {
			finalList = deferredValue.filter(
				(employee) => employee.user.isActive === false
			);
		} else {
			finalList = deferredValue;
		}
		return getRows(finalList);
	}, [activeRow, deferredValue]);

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
						active: activeRow === 'active',
						onClick: () => setActiveRow('active'),
						title: 'active',
					},
					{
						active: activeRow === 'on leave',
						onClick: () => setActiveRow('on leave'),
						title: 'on leave',
					},
					{
						active: activeRow === 'inactive',
						onClick: () => setActiveRow('inactive'),
						title: 'inactive',
					},
				],
			}}
		/>
	);
};

export default EmployeeTable;
