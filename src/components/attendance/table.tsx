import { Table, TableHeadType, TableRowType } from 'kite-react-tailwind';
import React from 'react';

import { AttendanceType } from '../../types';

const heads: TableHeadType = [
	{ value: 'date' },
	{ value: 'punch in' },
	{ value: 'punch out' },
	// { value: 'overtime (hours)' },
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
			// {
			// 	value:
			// 		attendance.overtime && attendance.overtime.status === 'APPROVED'
			// 			? attendance.overtime.hours
			// 			: '---',
			// },
		],
	}));

type TableType = {
	attendance: AttendanceType[];
	offset?: number;
};

const AttendanceTable = ({ attendance = [], offset = 0 }: TableType) => {
	const { offset: deferredOffset, attendance: deferredValue } =
		React.useDeferredValue({ attendance, offset });
	const rows = React.useMemo(() => getRows(deferredValue), [deferredValue]);
	return <Table sn={deferredOffset} heads={heads} rows={rows} />;
};

export default AttendanceTable;
