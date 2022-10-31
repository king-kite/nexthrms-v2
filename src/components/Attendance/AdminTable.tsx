import { Table, TableHeadType, TableRowType } from '@king-kite/react-kit';
import React from 'react';
import {
	FaCheckCircle,
	FaExclamationCircle,
	FaPen,
	FaTrash,
} from 'react-icons/fa';

import { useAlertContext, useAlertModalContext } from '../../store/contexts';
import { useDeleteAttendanceMutation } from '../../store/queries';
import { AttendanceCreateType, AttendanceType } from '../../types';

const heads: TableHeadType = [
	{ value: 'employee name' },
	{ value: 'date' },
	{ value: 'punch in' },
	{ value: 'punch out' },
	{ value: 'overtime (hours)' },
	{ type: 'actions', value: 'actions' },
];

const getRows = (
	data: AttendanceType[],
	disableAction: boolean,
	updateAtd: (
		form: AttendanceCreateType & {
			editId: string;
		}
	) => void,
	deleteAtd: (id: string) => void
): TableRowType[] =>
	data.map((attendance) => {
		const updateAttendance = () => {
			if (disableAction === false) {
				const punchIn = new Date(attendance.punchIn);

				const form: AttendanceCreateType & {
					editId: string;
				} = {
					editId: attendance.id,
					date: new Date(attendance.date).toLocaleDateString('en-CA'),
					punchIn: `${punchIn.getHours().toString().padStart(2, '0')}:${punchIn
						.getMinutes()
						.toString()
						.padStart(2, '0')}`,
					employee: attendance.employee.id,
				};
				if (attendance.punchOut) {
					const punchOut = new Date(attendance.punchOut);

					form.punchOut = `${punchOut
						.getHours()
						.toString()
						.padStart(2, '0')}:${punchOut
						.getMinutes()
						.toString()
						.padStart(2, '0')}`;
				}
				if (attendance.overtime) {
					form.overtime = {
						hours: attendance.overtime.hours,
						reason: attendance.overtime.reason,
					};
				}
				updateAtd(form);
			}
		};
		return {
			id: attendance.id,
			rows: [
				{
					value:
						attendance.employee.user.firstName +
						' ' +
						attendance.employee.user.lastName,
				},
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
				{
					type: 'actions',
					value: [
						{
							color: 'primary',
							disabled: disableAction,
							icon: FaPen,
							onClick: updateAttendance,
						},
						{
							color: 'danger',
							disabled: disableAction,
							icon: FaTrash,
							onClick: () => deleteAtd(attendance.id),
						},
					],
				},
			],
		};
	});

type TableType = {
	attendance: AttendanceType[];
	updateAtd: (
		form: AttendanceCreateType & {
			editId: string;
		}
	) => void;
	loading: boolean;
};

const AttendanceAdminTable = ({
	attendance = [],
	loading,
	updateAtd,
}: TableType) => {
	const [rows, setRows] = React.useState<TableRowType[]>([]);

	const { open: openAlert } = useAlertContext();
	const {
		close: closeModal,
		open: openModal,
		showLoader,
	} = useAlertModalContext();

	const { deleteAttendance: deleteAtd, isLoading: atdLoading } =
		useDeleteAttendanceMutation({
			onSuccess() {
				openAlert({
					type: 'success',
					message: 'Attendance record was deleted successfully!',
				});
			},
			onError(error) {
				closeModal();
				openAlert({
					message: error.message,
					type: 'danger',
				});
			},
		});

	React.useEffect(() => {
		setRows(getRows(attendance, loading, updateAtd, deleteAtd));
	}, [attendance, loading, updateAtd, deleteAtd]);

	return (
		<div className="mt-4 rounded-lg py-2 md:py-3 lg:py-4">
			<Table heads={heads} rows={rows} />
		</div>
	);
};

export default AttendanceAdminTable;
