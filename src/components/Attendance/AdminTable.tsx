import { Table, TableHeadType, TableRowType } from 'kite-react-tailwind';
import React from 'react';
import { FaPen, FaTrash, FaUserShield } from 'react-icons/fa';

import { TableAvatarEmailNameCell } from '../common';
import {
	ATTENDANCE_OBJECT_PERMISSIONS_PAGE_URL,
	DEFAULT_IMAGE,
	permissions,
} from '../../config';
import {
	useAlertContext,
	useAlertModalContext,
	useAuthContext,
} from '../../store/contexts';
import { useDeleteAttendanceMutation } from '../../store/queries';
import { AttendanceCreateType, AttendanceType } from '../../types';
import { getStringedDate, hasModelPermission } from '../../utils';

const heads: TableHeadType = [
	{
		style: {
			marginLeft: '3.5rem',
			minWidth: '70px',
			textAlign: 'left',
		},
		value: 'employee',
	},
	{ value: 'date' },
	{ value: 'punch in' },
	{ value: 'punch out' },
	{ value: 'overtime (hours)' },
	{ type: 'actions', value: 'actions' },
];

const getRows = (
	data: AttendanceType[],
	disableAction: boolean,
	canViewPermissions: boolean,
	updateAtd?: (
		form: AttendanceCreateType & {
			editId: string;
		}
	) => void,
	deleteAtd?: (id: string) => void
): TableRowType[] =>
	data.map((attendance) => {
		const actions: {
			color: string;
			disabled?: boolean;
			icon: (props: any) => JSX.Element;
			onClick?: () => void;
			link?: string;
		}[] = [];
		if (updateAtd) {
			const updateAttendance = () => {
				if (disableAction === false) {
					const punchIn = new Date(attendance.punchIn);

					const form: AttendanceCreateType & {
						editId: string;
					} = {
						editId: attendance.id,
						date: getStringedDate(attendance.date),
						punchIn: `${punchIn
							.getHours()
							.toString()
							.padStart(2, '0')}:${punchIn
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
			actions.push({
				color: 'primary',
				disabled: disableAction,
				icon: FaPen,
				onClick: updateAttendance,
			});
		}
		if (deleteAtd)
			actions.push({
				color: 'danger',
				disabled: disableAction,
				icon: FaTrash,
				onClick: () => deleteAtd(attendance.id),
			});
		if (canViewPermissions)
			actions.push({
				color: 'info',
				icon: FaUserShield,
				link: ATTENDANCE_OBJECT_PERMISSIONS_PAGE_URL(attendance.id),
			});

		return {
			id: attendance.id,
			rows: [
				{
					component: () => (
						<div className="w-full">
							<TableAvatarEmailNameCell
								email={attendance.employee.user.email}
								image={attendance.employee.user.profile?.image || DEFAULT_IMAGE}
								name={`${attendance.employee.user.firstName} ${attendance.employee.user.lastName}`}
							/>
						</div>
					),
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
					value: actions,
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

	const { data: authData } = useAuthContext();
	// has model permission
	const [canEdit, canDelete, canViewObjectPermissions] = React.useMemo(() => {
		const canEdit = authData
			? authData.isSuperUser ||
			  (authData.isAdmin &&
					hasModelPermission(authData.permissions, [
						permissions.attendance.EDIT,
					]))
			: false;
		const canDelete = authData
			? authData.isSuperUser ||
			  (authData.isAdmin &&
					hasModelPermission(authData.permissions, [
						permissions.attendance.DELETE,
					]))
			: false;
		const canViewObjectPermissions = authData
			? authData.isSuperUser ||
			  (authData.isAdmin &&
					hasModelPermission(authData.permissions, [
						permissions.permissionobject.VIEW,
					]))
			: false;
		return [canEdit, canDelete, canViewObjectPermissions];
	}, [authData]);

	const { deleteAttendance: deleteAtd } = useDeleteAttendanceMutation({
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
		setRows(
			getRows(
				attendance,
				loading,
				canViewObjectPermissions || false,
				canEdit ? updateAtd : undefined,
				canDelete ? deleteAtd : undefined
			)
		);
	}, [
		attendance,
		loading,
		canEdit,
		canDelete,
		canViewObjectPermissions,
		updateAtd,
		deleteAtd,
	]);

	return (
		<div className="mt-4 rounded-lg py-2 md:py-3 lg:py-4">
			<Table heads={heads} rows={rows} />
		</div>
	);
};

export default AttendanceAdminTable;
