import { Table, TableHeadType, TableRowType } from 'kite-react-tailwind';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaEye } from 'react-icons/fa';

import { EMPLOYEE_PAGE_URL } from '../../config/routes';
import { EmployeeType } from '../../types';
import { getStringedDate } from '../../utils';

const heads: TableHeadType = [
	{ value: 'first name' },
	{ value: 'last name' },
	{ value: 'email' },
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
				link: EMPLOYEE_PAGE_URL(employee.id),
				value: employee.user.firstName || '---',
			},
			{ value: employee.user.lastName || '---' },
			{ value: employee.user.email || '---' },
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
						icon: FaEye,
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
	const [rows, setRows] = useState<TableRowType[]>([]);
	const [activeRow, setActiveRow] = useState<
		'all' | 'active' | 'on leave' | 'inactive'
	>('all');

	useEffect(() => {
		let finalList;
		if (activeRow === 'on leave') {
			finalList = employees.filter((employee) => employee.leaves.length > 0);
		} else if (activeRow === 'active') {
			finalList = employees.filter(
				(employee) =>
					employee.user.isActive === true && employee.leaves.length === 0
			);
		} else if (activeRow === 'inactive') {
			finalList = employees.filter(
				(employee) => employee.user.isActive === false
			);
		} else {
			finalList = employees;
		}
		setRows(getRows(finalList));
	}, [activeRow, employees]);

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
		</div>
	);
};

export default EmployeeTable;
