import { Table, TableHeadType, TableRowType } from 'kite-react-tailwind';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaCheckCircle, FaEye, FaTimesCircle } from 'react-icons/fa';

import { USER_PAGE_URL } from '../../config/routes';
import { UserType } from '../../types';

const heads: TableHeadType = [
	{ value: 'first name' },
	{ value: 'last name' },
	{ value: 'email' },
	{ value: 'role' },
	{ value: 'status' },
	{ value: 'email verified ' },
	{ value: 'admin' },
	{ value: 'superuser ' },
	{ value: 'last update' },
	{ value: 'date joined' },
	{ type: 'actions', value: 'view' },
];

const getRows = (data: UserType[]): TableRowType[] =>
	data.map((user) => ({
		id: user.id,
		rows: [
			{
				link: USER_PAGE_URL(user.id),
				value: user.firstName || '---',
			},
			{ value: user.lastName || '---' },
			{ value: user.email || '---' },
			{
				options: {
					bg:
						user.employee && user.client
							? 'secondary'
							: user.client
							? 'pacify'
							: 'danger',
					color: user.employee && !user.client ? 'bg-purple-600' : undefined,
				},
				type: 'badge',
				value:
					user.employee && user.client
						? 'client & employee'
						: user.client
						? 'client'
						: user.employee
						? 'employee'
						: 'user',
			},
			{
				options: {
					bg:
						user.employee?.leaves.length && user.employee?.leaves.length > 0
							? 'warning'
							: user.isActive
							? 'green'
							: 'danger',
				},
				type: 'badge',
				value:
					user.employee?.leaves.length && user.employee?.leaves.length > 0
						? 'on leave'
						: user.isActive
						? 'active'
						: 'inactive',
			},
			{
				options: {
					className: `${
						user.isEmailVerified ? 'text-green-600' : 'text-red-600'
					} text-sm md:text-base`,
				},
				type: 'icon',
				icon: user.isEmailVerified ? FaCheckCircle : FaTimesCircle,
			},
			{
				options: {
					className: `${
						user.isAdmin ? 'text-green-600' : 'text-red-600'
					} text-sm md:text-base`,
				},
				type: 'icon',
				icon: user.isAdmin ? FaCheckCircle : FaTimesCircle,
			},
			{
				options: {
					className: `${
						user.isSuperUser ? 'text-green-600' : 'text-red-600'
					} text-sm md:text-base`,
				},
				type: 'icon',
				icon: user.isSuperUser ? FaCheckCircle : FaTimesCircle,
			},
			{
				value: user.updatedAt
					? new Date(user.updatedAt).toLocaleDateString('en-CA')
					: '---',
			},
			{
				value: user.createdAt
					? new Date(user.createdAt).toLocaleDateString('en-CA')
					: '---',
			},
			{
				type: 'actions',
				value: [
					{
						color: 'primary',
						icon: FaEye,
						link: USER_PAGE_URL(user.id),
					},
				],
			},
		],
	}));

type TableType = {
	users: UserType[];
};

const UserTable = ({ users }: TableType) => {
	const [rows, setRows] = useState<TableRowType[]>([]);
	const [activeRow, setActiveRow] = useState<
		'all' | 'active' | 'on leave' | 'inactive' | 'clients' | 'employees'
	>('all');

	useEffect(() => {
		let finalList;
		if (activeRow === 'on leave') {
			finalList = users.filter(
				(user) =>
					user.employee?.leaves.length && user.employee?.leaves.length > 0
			);
		} else if (activeRow === 'active') {
			finalList = users.filter(
				(user) => user.isActive === true && user.employee?.leaves.length === 0
			);
		} else if (activeRow === 'inactive') {
			finalList = users.filter((user) => user.isActive === false);
		} else if (activeRow === 'clients') {
			finalList = users.filter((user) => user.client && user);
		} else if (activeRow === 'employees') {
			finalList = users.filter((user) => user.employee && user);
		} else {
			finalList = users;
		}
		setRows(getRows(finalList));
	}, [activeRow, users]);

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
							active: activeRow === 'clients',
							onClick: () => setActiveRow('clients'),
							title: 'clients',
						},
						{
							active: activeRow === 'employees',
							onClick: () => setActiveRow('employees'),
							title: 'employees',
						},
						{
							active: activeRow === 'active',
							onClick: () => setActiveRow('active'),
							title: 'active',
						},
						{
							active: activeRow === 'inactive',
							onClick: () => setActiveRow('inactive'),
							title: 'inactive',
						},
						{
							active: activeRow === 'on leave',
							onClick: () => setActiveRow('on leave'),
							title: 'on leave',
						},
					],
				}}
			/>
		</div>
	);
};

export default UserTable;
