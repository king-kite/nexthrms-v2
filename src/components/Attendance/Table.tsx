import { Table, TableHeadType, TableRowType } from '@king-kite/react-kit';
import { useEffect, useState } from 'react';

import { AttendanceType } from '../../types';

const heads: TableHeadType = [
	{ value: 'date' },
	{ value: 'punch in' },
	{ value: 'punch out' },
	{ value: 'overtime (hours)' },
	// { value: "production" },
	// { value: "break" },
];

const getRows = (data: AttendanceType[]): TableRowType[] =>
	data.map((attendance) => ({
		id: attendance.id,
		rows: [
			{ value: new Date(attendance.date).toDateString() },
			{ value: new Date(attendance.punchIn).toLocaleTimeString() },
			{
				value: attendance.punchOut
					? new Date(attendance.punchOut).toLocaleTimeString()
					: '---',
			},
			{
				value:
					attendance.overtime && attendance.overtime.status === 'APPROVED'
						? attendance.overtime.hours
						: '---',
			},
		],
	}));

type TableType = {
	attendance: AttendanceType[];
};

const AttendanceTable = ({ attendance = [] }: TableType) => {
	const [rows, setRows] = useState<TableRowType[]>([]);

	useEffect(() => {
		setRows(getRows(attendance));
	}, [attendance]);

	return (
		<div className="mt-4 rounded-lg py-2 md:py-3 lg:py-4">
			<Table heads={heads} rows={rows} />
		</div>
	);
};

export default AttendanceTable;
