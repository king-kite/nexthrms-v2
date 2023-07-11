import { overtimeHeaders as headers, permissions } from '../../../../config';
import { getAllOvertimeAdmin } from '../../../../db/queries/overtime';
import {
	createNotification,
	exportData,
	getObjectPermissionExportData,
	getRecords,
} from '../../../../db/utils';
import { admin } from '../../../../middlewares';
import { NextApiRequestExtendUser, OvertimeType } from '../../../../types';
import { hasModelPermission } from '../../../../utils/permission';
import { NextErrorMessage } from '../../../../utils/classes';
import { handlePrismaErrors } from '../../../../validators';

type OvertimeExportType = {
	approved: number;
	denied: number;
	pending: number;
	total: number;
	result: OvertimeType[];
};

async function getData(req: NextApiRequestExtendUser) {
	const placeholder: OvertimeExportType = {
		approved: 0,
		denied: 0,
		pending: 0,
		result: [],
		total: 0,
	};

	const result = await getRecords({
		model: 'overtime',
		perm: 'overtime',
		query: req.query,
		user: req.user,
		placeholder,
		getData(params) {
			return getAllOvertimeAdmin(
				params
			) as unknown as Promise<OvertimeExportType>;
		},
	});

	const data = result ? result.data : placeholder;

	const values = data.result.map((overtime) => {
		return {
			id: overtime.id,
			employee: overtime.employee.user.email,
			date: overtime.date,
			type: overtime.type,
			hours: overtime.hours,
			status: overtime.status,
			reason: overtime.reason,
			created_by: overtime.createdBy ? overtime.createdBy.user.email : null,
			approved_by: overtime.approvedBy ? overtime.approvedBy.user.email : null,
			created_at: overtime.createdAt,
			updated_at: overtime.updatedAt,
		};
	});

	const perms = await getObjectPermissionExportData({
		ids: values.map((value) => value.id),
		model: 'overtime',
	});

	return {
		data: values,
		permissions: perms,
	};
}

export default admin().get(async (req, res) => {
	const hasExportPerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [permissions.overtime.EXPORT]);

	if (!hasExportPerm) throw new NextErrorMessage(403);

	getData(req)
		.then((data) => {
			return exportData(data, headers, {
				title: 'overtime',
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
				title: 'Overtime data export was successful.',
				type: 'DOWNLOAD',
			});
		})
		.catch((err) => {
			const error = handlePrismaErrors(err);
			createNotification({
				message: error.message,
				recipient: req.user.id,
				title: 'Overtime data export failed.',
				type: 'ERROR',
			});
		});

	return res.status(200).json({
		status: 'success',
		message:
			'Your request was received successfully. A notification will be sent to you with a download link.',
	});
});
