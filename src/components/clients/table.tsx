import { Table, TableHeadType, TableRowType } from 'kite-react-tailwind';
import Link from 'next/link';
import React from 'react';
import { FaArrowRight } from 'react-icons/fa';

import { TableAvatarEmailNameCell } from '../common';
import { CLIENT_PAGE_URL, DEFAULT_IMAGE } from '../../config';
import { ClientType } from '../../types';

const heads: TableHeadType = [
	{
		style: {
			marginLeft: '3.5rem',
			minWidth: '70px',
			textAlign: 'left',
		},
		value: 'contact person',
	},
	{ value: 'company name' },
	{ value: 'phone' },
	{ value: 'status' },
	{ type: 'actions', value: 'view' },
];

const getRows = (data: ClientType[]): TableRowType[] =>
	data.map((client) => ({
		id: client.id,
		rows: [
			{
				component: () => (
					<Link href={CLIENT_PAGE_URL(client.id)}>
						<a className="inline-block w-full hover:bg-gray-100 hover:even:bg-gray-300">
							<TableAvatarEmailNameCell
								email={client.contact.email}
								image={client.contact.profile?.image?.url || DEFAULT_IMAGE}
								name={`${client.contact.firstName} ${client.contact.lastName}`}
							/>
						</a>
					</Link>
				),
			},
			{ value: client.company || '---' },
			{ value: client.contact.profile?.phone || '---' },
			{
				options: {
					bg: client.contact.isActive ? 'success' : 'error',
				},
				type: 'badge',
				value: client.contact.isActive ? 'active' : 'inactive',
			},
			{
				type: 'actions',
				value: [
					{
						color: 'primary',
						icon: FaArrowRight,
						link: CLIENT_PAGE_URL(client.id),
					},
				],
			},
		],
	}));

type TableType = {
	clients: ClientType[];
	offset?: number;
};

const ClientTable = ({ clients, offset = 0 }: TableType) => {
	const [activeRow, setActiveRow] = React.useState<
		'all' | 'active' | 'inactive'
	>('all');

	const { offset: deferredOffset, clients: deferredValue } =
		React.useDeferredValue({ offset, clients });
	const rows = React.useMemo(() => {
		let finalList;
		if (activeRow === 'active') {
			finalList = deferredValue.filter(
				(client) => client.contact.isActive === true
			);
		} else if (activeRow === 'inactive') {
			finalList = deferredValue.filter(
				(client) => client.contact.isActive === false
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
						active: activeRow === 'active',
						onClick: () => setActiveRow('active'),
						title: 'active',
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

export default ClientTable;
