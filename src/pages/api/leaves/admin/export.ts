import { leaveHeaders as headers, permissions } from '../../../../config';
import { getLeavesAdmin } from '../../../../db/queries/leaves';
import {
	createNotification,
	exportData,
	getObjectPermissionExportData,
	getRecords,
} from '../../../../db/utils';
import { admin } from '../../../../middlewares';
import {
	GetLeavesResponseType,
	NextApiRequestExtendUser,
} from '../../../../types';
import { hasModelPermission } from '../../../../utils/permission';
import { NextErrorMessage } from '../../../../utils/classes';
import { handlePrismaErrors } from '../../../../validators';

async function getData(req: NextApiRequestExtendUser) {
	const placeholder: GetLeavesResponseType['data'] = {
		approved: 0,
		denied: 0,
		pending: 0,
		result: [],
		total: 0,
	};

	const result = await getRecords<GetLeavesResponseType['data']>({
		model: 'leaves',
		perm: 'leave',
		query: req.query,
		user: req.user,
		placeholder,
		getData(params) {
			return getLeavesAdmin(params);
		},
	});

	const data = result ? result.data : placeholder;

	const values = data.result.map((leave) => {
		return {
			id: leave.id,
			employee_id: leave.employee.id,
			start_date: leave.startDate,
			end_date: leave.endDate,
			type: leave.type,
			status: leave.status,
			reason: leave.reason,
			created_by: leave.createdBy ? leave.createdBy.id : null,
			approved_by: leave.approvedBy ? leave.approvedBy.id : null,
			created_at: leave.createdAt,
			updated_at: leave.updatedAt,
		};
	});

	const perms = await getObjectPermissionExportData({
		ids: values.map((value) => value.id),
		model: 'leaves',
	});

	return {
		data: values,
		permissions: perms,
	};
}

export default admin().get(async (req, res) => {
	const hasExportPerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [permissions.leave.EXPORT]);

	if (!hasExportPerm) throw new NextErrorMessage(403);

	getData(req)
		.then((data) => {
			return exportData(data, headers, {
				title: 'leaves',
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
				title: 'Leaves data export was successful.',
				type: 'DOWNLOAD',
			});
		})
		.catch((err) => {
			const error = handlePrismaErrors(err);
			createNotification({
				message: error.message,
				recipient: req.user.id,
				title: 'Leaves data export failed.',
				type: 'ERROR',
			});
		});

	return res.status(200).json({
		status: 'success',
		message:
			'Your request was received successfully. A notification will be sent to you with a download link.',
	});
});
