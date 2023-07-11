import { attendanceHeaders as headers, permissions } from '../../../../config';
import { getAttendanceAdmin } from '../../../../db/queries/attendance';
import {
	createNotification,
	exportData,
	getObjectPermissionExportData,
	getRecords,
} from '../../../../db/utils';
import { admin } from '../../../../middlewares';
import { NextApiRequestExtendUser } from '../../../../types';
import { hasModelPermission } from '../../../../utils/permission';
import { NextErrorMessage } from '../../../../utils/classes';
import { handlePrismaErrors } from '../../../../validators';

async function getData(req: NextApiRequestExtendUser) {
	const placeholder = {
		total: 0,
		result: [],
	};
	const result = await getRecords({
		model: 'attendance',
		perm: 'attendance',
		query: req.query,
		placeholder,
		user: req.user,
		getData(params) {
			return getAttendanceAdmin(params);
		},
	});

	const data = result ? result.data : placeholder;

	const values = data.result.map((attend) => {
		return {
			id: attend.id,
			employee_id: attend.employee.id,
			date: attend.date,
			punch_in: attend.punchIn,
			punch_out: attend.punchOut ? attend.punchOut : null,
			updated_at: attend.updatedAt,
		};
	});

	const perms = await getObjectPermissionExportData({
		ids: values.map((value) => value.id),
		model: 'attendance',
	});

	return {
		data: values,
		permissions: perms,
	};
}

export default admin().get(async (req, res) => {
	const hasPerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [
			permissions.attendance.EXPORT,
		]);

	if (!hasPerm) throw new NextErrorMessage(403);

	getData(req)
		.then((data) => {
			return exportData(data, headers, {
				title: 'attendance',
				type: (req.query.type as string) || 'csv',
				userId: req.user.id,
			});
		})
		.then((data) => {
			let message =
				'File exported successfully. Click on the download link to proceed!';
			if (data.size) {
				const size = String(data.size / (1024 * 1024));
				const sizeString =
					size.split('.')[0] + '.' + size.split('.')[1].slice(0, 2);
				message = `File (${sizeString}MB) exported successfully. Click on the download link to proceed!`;
			}
			createNotification({
				message,
				messageId: data.file,
				recipient: req.user.id,
				title: 'Attendance data export was successful.',
				type: 'DOWNLOAD',
			});
		})
		.catch((err) => {
			const error = handlePrismaErrors(err);
			createNotification({
				message: error.message,
				recipient: req.user.id,
				title: 'Attendance data export failed.',
				type: 'ERROR',
			});
		});

	return res.status(200).json({
		status: 'success',
		message:
			'Your request was received successfully. A notification will be sent to you with a download link.',
	});
});
