import { managedFileHeaders as headers, permissions } from '../../../config';
import { getManagedFiles } from '../../../db/queries/managed-files';
import {
	createNotification,
	exportData,
	getObjectPermissionExportData,
	getRecords,
} from '../../../db/utils';
import { admin } from '../../../middlewares';
import { NextApiRequestExtendUser } from '../../../types';
import { hasModelPermission } from '../../../utils/permission';
import { NextApiErrorMessage } from '../../../utils/classes';
import { handlePrismaErrors } from '../../../validators';

async function getData(req: NextApiRequestExtendUser) {
	const placeholder = {
		total: 0,
		result: [],
	};

	const result = await getRecords({
		query: req.query,
		user: req.user,
		model: 'managed_files',
		perm: 'managedfile',
		placeholder,
		getData(params) {
			return getManagedFiles(params);
		},
	});

	const data = result ? result.data : placeholder;

	const files = data.result.map((file) => ({
		id: file.id,
		name: file.name,
		url: file.url,
		size: file.size,
		storage_info_keys: file.storageInfo
			? Object.keys(file.storageInfo).join(',')
			: null,
		storage_info_values: file.storageInfo
			? Object.values(file.storageInfo).join(',')
			: null,
		type: file.type,
		user_id: file.user ? file.user.id : undefined,
		updated_at: file.updatedAt,
		created_at: file.createdAt,
	}));

	const perms = await getObjectPermissionExportData({
		ids: files.map((file) => file.id),
		model: 'managed_files',
	});

	return {
		data: files,
		permissions: perms,
	};
}

export default admin().get(async (req, res) => {
	const hasPerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [
			permissions.managedfile.EXPORT,
		]);

	if (!hasPerm) throw new NextApiErrorMessage(403);

	getData(req)
		.then((data) => {
			return exportData(data, headers, {
				title: 'file manager',
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
				title: 'File manager data export was successful.',
				type: 'DOWNLOAD',
			});
		})
		.catch((err) => {
			const error = handlePrismaErrors(err);
			createNotification({
				message: error.message,
				recipient: req.user.id,
				title: 'File manager data export failed.',
				type: 'ERROR',
			});
		});

	return res.status(200).json({
		status: 'success',
		message:
			'Your request was received successfully. A notification will be sent to you with a download link.',
	});
});
