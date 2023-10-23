import { Button, InfoComp, InfoCompType } from 'kite-react-tailwind';
import React from 'react';
import { FaPen, FaTrash } from 'react-icons/fa';

import { permissions, DEFAULT_IMAGE } from '../../config';
import { useAlertContext, useAuthContext } from '../../store/contexts';
import { useDeleteAttendanceMutation } from '../../store/queries/attendance';
import { useGetUserObjectPermissionsQuery } from '../../store/queries/permissions';
import { AttendanceType, AttendanceCreateType } from '../../types';
import { getMediaUrl, getStringedDate, hasModelPermission } from '../../utils';

function Details({
	data,
	editAttendance,
	closePanel,
}: {
	data: AttendanceType;
	editAttendance: (data: AttendanceCreateType & { editId: string }) => void;
	closePanel: () => void;
}) {
	const { data: authData } = useAuthContext();

	const { open: openAlert } = useAlertContext();

	const { data: objPermData } = useGetUserObjectPermissionsQuery({
		modelName: 'attendance',
		objectId: data.id,
	});

	const { deleteAttendance: deleteAtd, isLoading: delLoading } = useDeleteAttendanceMutation({
		onSuccess() {
			closePanel();
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

	const [canEdit, canDelete] = React.useMemo(() => {
		let canDelete = false;
		let canEdit = false;

		// Check model permissions
		if (authData && (authData.isAdmin || authData.isSuperUser)) {
			canEdit =
				!!authData.isSuperUser ||
				(!!authData.isAdmin &&
					hasModelPermission(authData.permissions, [permissions.attendance.EDIT]));
			canDelete =
				!!authData.isSuperUser ||
				(!!authData.isAdmin &&
					hasModelPermission(authData.permissions, [permissions.attendance.DELETE]));
		}

		// If the user doesn't have model edit permissions, then check obj edit permission
		if (!canEdit && objPermData) canEdit = objPermData.edit;
		// If the user doesn't have model edit permissions, then check obj edit permission
		if (!canDelete && objPermData) canDelete = objPermData.delete;

		return [canEdit, canDelete];
	}, [authData, objPermData]);

	const infos = React.useMemo(() => {
		let detail: InfoCompType['infos'] = [
			{
				title: 'Employee Image',
				type: 'image',
				value: {
					src: data.employee.user.profile?.image
						? getMediaUrl(data.employee.user.profile.image)
						: DEFAULT_IMAGE,
					alt: data.employee.user.firstName + ' ' + data.employee.user.lastName,
				},
			},
			{
				title: 'First Name',
				value: data.employee.user.firstName || '-------',
			},
			{
				title: 'Last Name',
				value: data.employee.user.lastName || '-------',
			},
			{
				title: 'Email',
				value: data.employee.user.email || '-------',
			},
			{
				title: 'Date',
				value: new Date(data.date).toDateString(),
			},
			{ title: 'Punch In', value: new Date(data.punchIn).toLocaleTimeString() },
			{
				title: 'Punch Out',
				value: data.punchOut ? new Date(data.punchOut).toLocaleTimeString() : '-------',
			},
			// {
			// 	title: 'Overtime',
			// 	value: data.overtime ? data.overtime.hours : '-------',
			// },
			// {
			// 	title: 'Overtime Status',
			// 	value: data.overtime ? data.overtime.status : '-------',
			// 	type: 'badge',
			// 	options: {
			// 		bg: data.overtime
			// 			? data.overtime.status === 'DENIED'
			// 				? 'danger'
			// 				: data.overtime.status === 'PENDING'
			// 				? 'warning'
			// 				: 'success'
			// 			: 'info',
			// 	},
			// },
		];
		return detail;
	}, [data]);

	return (
		<>
			{(canEdit || canDelete) && (
				<div className="flex items-center justify-end gap-4 my-3 w-full">
					{canEdit && (
						<div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
							<Button
								iconLeft={FaPen}
								onClick={() => {
									if (!canEdit || !data) return;
									const punchIn = new Date(data.punchIn);

									const form: AttendanceCreateType & {
										editId: string;
									} = {
										editId: data.id,
										date: getStringedDate(data.date),
										punchIn: `${punchIn.getHours().toString().padStart(2, '0')}:${punchIn
											.getMinutes()
											.toString()
											.padStart(2, '0')}`,
										employee: data.employee.id,
									};
									if (data.punchOut) {
										const punchOut = new Date(data.punchOut);

										form.punchOut = `${punchOut.getHours().toString().padStart(2, '0')}:${punchOut
											.getMinutes()
											.toString()
											.padStart(2, '0')}`;
									}
									editAttendance(form);
								}}
								padding="px-4 py-2 sm:py-3"
								title="Edit"
							/>
						</div>
					)}
					{canDelete && (
						<div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
							<Button
								bg="bg-red-600 hover:bg-red-500"
								iconLeft={FaTrash}
								onClick={() => deleteAtd(data.id)}
								padding="px-4 py-2 sm:py-3"
								title="Delete"
							/>
						</div>
					)}
				</div>
			)}
			<div className="pt-4">
				<InfoComp infos={infos} />
			</div>
		</>
	);
}

export default Details;
