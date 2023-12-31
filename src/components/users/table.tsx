import { Table, TableHeadType, TableRowType } from 'kite-react-tailwind';
import Link from 'next/link';
import React from 'react';
import { FaArrowRight, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

import { TableAvatarEmailNameCell } from '../common/table/cells';
import { USER_PAGE_URL } from '../../config/routes';
import { DEFAULT_IMAGE } from '../../config/static';
import type { UserType } from '../../types';
import { getStringedDate } from '../../utils/dates';
import { getMediaUrl } from '../../utils/media';

const heads: TableHeadType = [
	{
		style: {
			marginLeft: '3.5rem',
			minWidth: '70px',
			textAlign: 'left',
		},
		value: 'user',
	},
	{ value: 'role' },
	{ value: 'status' },
	{ value: 'email verified ' },
	{ value: 'admin' },
	{ value: 'superuser' },
	{ value: 'last update' },
	{ value: 'date joined' },
	{ type: 'actions', value: 'view' },
];

const getRows = (data: UserType[]): TableRowType[] =>
	data.map((user) => ({
		id: user.id,
		rows: [
			{
				component: () => (
					<Link href={USER_PAGE_URL(user.id)}>
						<a className="inline-block w-full hover:bg-gray-100 hover:even:bg-gray-300">
							<TableAvatarEmailNameCell
								email={user.email}
								image={user.profile?.image ? getMediaUrl(user.profile.image) : DEFAULT_IMAGE}
								name={`${user.firstName} ${user.lastName}`}
							/>
						</a>
					</Link>
				),
			},
			{
				options: {
					bg: user.employee && user.client ? 'secondary' : user.client ? 'pacify' : 'danger',
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
							? 'success'
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
					className: `${user.isAdmin ? 'text-green-600' : 'text-red-600'} text-sm md:text-base`,
				},
				type: 'icon',
				icon: user.isAdmin ? FaCheckCircle : FaTimesCircle,
			},
			{
				options: {
					className: `${user.isSuperUser ? 'text-green-600' : 'text-red-600'} text-sm md:text-base`,
				},
				type: 'icon',
				icon: user.isSuperUser ? FaCheckCircle : FaTimesCircle,
			},
			{
				value: user.updatedAt ? getStringedDate(user.updatedAt) : '---',
			},
			{
				value: user.createdAt ? getStringedDate(user.createdAt) : '---',
			},
			{
				type: 'actions',
				value: [
					{
						color: 'primary',
						icon: FaArrowRight,
						link: USER_PAGE_URL(user.id),
					},
				],
			},
		],
	}));

type TableType = {
	users: UserType[];
	offset?: number;
};

const UserTable = ({ offset = 0, users }: TableType) => {
	const [activeRow, setActiveRow] = React.useState<
		'all' | 'active' | 'on leave' | 'inactive' | 'clients' | 'employees'
	>('all');

	const { users: deferredValue, offset: deferredOffset } = React.useDeferredValue({
		users,
		offset,
	});
	const rows = React.useMemo(() => {
		let finalList;
		if (activeRow === 'on leave') {
			finalList = deferredValue.filter(
				(user) => user.employee?.leaves.length && user.employee?.leaves.length > 0
			);
		} else if (activeRow === 'active') {
			finalList = deferredValue.filter((user) =>
				user.employee ? user.isActive === true && user.employee.leaves.length === 0 : user.isActive
			);
		} else if (activeRow === 'inactive') {
			finalList = deferredValue.filter((user) => user.isActive === false);
		} else if (activeRow === 'clients') {
			finalList = deferredValue.filter((user) => user.client && user);
		} else if (activeRow === 'employees') {
			finalList = deferredValue.filter((user) => user.employee && user);
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
	);
};

export default UserTable;
