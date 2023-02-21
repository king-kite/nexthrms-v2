import { Table, TableHeadType, TableRowType } from 'kite-react-tailwind';
import React from 'react';

import { PermissionType } from '../../../types';
import { toCapitalize } from '../../../utils';

const heads: TableHeadType = [
	{ value: 'name' },
	{ value: 'category' },
	{ value: 'description' },
];

const getRows = (data: PermissionType[]): TableRowType[] =>
	data.map((permission) => ({
		id: permission.id,
		rows: [
			{ value: toCapitalize(permission.name) || '---' },
			{
				value: permission.category
					? toCapitalize(permission.category.name)
					: '---',
			},
			{ value: permission.description },
		],
	}));

type TableType = {
	permissions: PermissionType[];
};

const PermissionTable = ({ permissions = [] }: TableType) => {
	const [rows, setRows] = React.useState<TableRowType[]>([]);

	React.useEffect(() => {
		setRows(getRows(permissions));
	}, [permissions]);

	return (
		<div className="mt-4 rounded-lg py-2 md:py-3 lg:py-4">
			<Table heads={heads} rows={rows} />
		</div>
	);
};

export default PermissionTable;
