import { Table, TableHeadType, TableRowType } from 'kite-react-tailwind';
import Link from 'next/link';
import React from 'react';
import { FaEye, FaPen, FaTrash, FaUserShield } from 'react-icons/fa';

import { TableAvatarEmailNameCell } from '../common';
import {
	ATTENDANCE_OBJECT_PERMISSIONS_PAGE_URL,
	DEFAULT_IMAGE,
	permissions,
} from '../../config';
import { useAlertContext, useAuthContext } from '../../store/contexts';
import { useDeleteAttendanceMutation } from '../../store/queries/attendance';
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
	// { value: 'overtime (hours)' },
	{ type: 'actions', value: 'actions' },
];

const getRows = (
	data: AttendanceType[],
	disableAction: boolean,
	canViewPermissions: boolean,
	showAttendance: (attendance: AttendanceType) => void,
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
		}[] = [
			{
				color: 'primary',
				icon: FaEye,
				onClick: () => showAttendance(attendance),
			},
		];
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
								image={
									attendance.employee.user.profile?.image?.url || DEFAULT_IMAGE
								}
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
				// {
				// 	value:
				// 		attendance.overtime && attendance.overtime.status === 'APPROVED'
				// 			? attendance.overtime.hours
				// 			: '---',
				// },
				{
					type: 'actions',
					value: actions,
				},
			],
		};
	});

type TableType = {
	attendance: AttendanceType[];
	showAttendance: (attendance: AttendanceType) => void;
	updateAtd: (
		form: AttendanceCreateType & {
			editId: string;
		}
	) => void;
	loading: boolean;
};

const AttendanceAdminTable = ({
	attendance = [],
	showAttendance,
	loading,
	updateAtd,
}: TableType) => {
	const { open: openAlert } = useAlertContext();

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

	const { deleteAttendance: deleteAtd, isLoading: delLoading } =
		useDeleteAttendanceMutation({
			onSuccess() {
				openAlert({
					type: 'success',
					message: 'Attendance record was deleted successfully!',
				});
			},
			onError(error) {
				openAlert({
					message: error.message,
					type: 'danger',
				});
			},
		});

	const deferredValue = React.useDeferredValue(attendance);

	const rows = React.useMemo(
		() =>
			getRows(
				deferredValue,
				loading,
				canViewObjectPermissions || false,
				showAttendance,
				canEdit ? updateAtd : undefined,
				canDelete ? deleteAtd : undefined
			),
		[
			deferredValue,
			loading,
			canEdit,
			canDelete,
			canViewObjectPermissions,
			showAttendance,
			updateAtd,
			deleteAtd,
		]
	);

	return (
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
		/>
	);
};

export default AttendanceAdminTable;
