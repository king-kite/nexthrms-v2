import { Table, TableHeadType, TableRowType } from 'kite-react-tailwind';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaEye } from 'react-icons/fa';

import { CLIENT_PAGE_URL } from '../../config';
import { ClientType } from '../../types';

const heads: TableHeadType = [
	{ value: 'company name' },
	{ value: 'contact person' },
	{ value: 'email' },
	{ value: 'phone' },
	{ value: 'status' },
	{ type: 'actions', value: 'view' },
];

const getRows = (data: ClientType[]): TableRowType[] =>
	data.map((client) => ({
		id: client.id,
		rows: [
			{ link: CLIENT_PAGE_URL(client.id), value: client.company || '---' },
			{ value: client.contact.firstName + ' ' + client.contact.lastName },
			{ value: client.contact.email || '---' },
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
						icon: FaEye,
						link: CLIENT_PAGE_URL(client.id),
					},
				],
			},
		],
	}));

type TableType = {
	clients: ClientType[];
};

const ClientTable = ({ clients }: TableType) => {
	const [rows, setRows] = useState<TableRowType[]>([]);
	const [activeRow, setActiveRow] = useState<'all' | 'active' | 'inactive'>(
		'all'
	);

	useEffect(() => {
		let finalList;
		if (activeRow === 'active') {
			finalList = clients.filter((client) => client.contact.isActive === true);
		} else if (activeRow === 'inactive') {
			finalList = clients.filter((client) => client.contact.isActive === false);
		} else {
			finalList = clients;
		}
		setRows(getRows(finalList));
	}, [activeRow, clients]);

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

export default ClientTable;
