import { departmentHeaders as headers, permissions } from '../../../config';
import { getDepartments } from '../../../db/queries/departments';
import {
	createNotification,
	exportData,
	getObjectPermissionExportData,
	getRecords,
} from '../../../db/utils';
import { admin } from '../../../middlewares';
import {
	GetDepartmentsResponseType,
	NextApiRequestExtendUser,
} from '../../../types';
import { hasModelPermission } from '../../../utils/permission';
import { NextErrorMessage } from '../../../utils/classes';
import { handlePrismaErrors } from '../../../validators';

// Get the records from the database, including the permissions
async function getData(req: NextApiRequestExtendUser) {
	const placeholder: GetDepartmentsResponseType['data'] = {
		total: 0,
		result: [],
	};

	const result = await getRecords<GetDepartmentsResponseType['data']>({
		model: 'departments',
		perm: 'department',
		query: req.query,
		user: req.user,
		placeholder,
		getData(params) {
			return getDepartments(params);
		},
	});

	const data = result ? result.data : placeholder;

	const values = data.result.map((value) => {
		return {
			id: value.id,
			name: value.name,
			updated_at: value.updatedAt,
			created_at: value.createdAt,
		};
	});

	const perms = await getObjectPermissionExportData({
		ids: values.map((value) => value.id),
		model: 'departments',
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
			permissions.department.EXPORT,
		]);

	if (!hasPerm) throw new NextErrorMessage(403);

	getData(req)
		.then((data) => {
			return exportData(data, headers, {
				title: 'departments',
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
				title: 'Departments data export was successful.',
				type: 'DOWNLOAD',
			});
		})
		.catch((err) => {
			const error = handlePrismaErrors(err);
			createNotification({
				message: error.message,
				recipient: req.user.id,
				title: 'Departments data export failed.',
				type: 'ERROR',
			});
		});

	return res.status(200).json({
		status: 'success',
		message:
			'Your request was received successfully. A notification will be sent to you with a download link.',
	});
});
