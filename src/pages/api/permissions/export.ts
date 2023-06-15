import {
	permissionHeaders as headers,
	permissions as perms,
} from '../../../config';
import { getPermissions } from '../../../db';
import {
	createNotification,
	exportData,
	getObjectPermissionExportData,
	getRecords,
} from '../../../db/utils';
import { admin } from '../../../middlewares';
import { PermissionType, NextApiRequestExtendUser } from '../../../types';
import { hasModelPermission } from '../../../utils';
import { NextApiErrorMessage } from '../../../utils/classes';
import { handlePrismaErrors } from '../../../validators';

async function getData(req: NextApiRequestExtendUser) {
	const placeholder: {
		total: number;
		result: PermissionType[];
	} = {
		total: 0,
		result: [],
	};

	const result = await getRecords<{
		total: number;
		result: PermissionType[];
	}>({
		model: 'permissions',
		perm: 'permission',
		query: req.query,
		user: req.user,
		placeholder: {
			total: 0,
			result: [],
		},
		getData(params) {
			return getPermissions(params);
		},
	});

	const data = result ? result.data : placeholder;

	const values = data.result.map((permission) => {
		return {
			name: permission.name,
			codename: permission.codename,
			description: permission.description || null,
			category: permission.category ? permission.category.name : null,
			id: permission.id,
		};
	});

	const perms = await getObjectPermissionExportData({
		ids: values.map((value) => value.id),
		model: 'permissions',
	});

	return {
		data: values,
		permissions: perms,
	};
}

export default admin().get(async (req, res) => {
	const hasExportPerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [perms.permission.EXPORT]);

	if (!hasExportPerm) throw new NextApiErrorMessage(403);

	getData(req)
		.then((data) => {
			return exportData(data, headers, {
				title: 'permissions',
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
				title: 'Permissions data export was successful.',
				type: 'DOWNLOAD',
			});
		})
		.catch((err) => {
			const error = handlePrismaErrors(err);
			createNotification({
				message: error.message,
				recipient: req.user.id,
				title: 'Permissions data export failed.',
				type: 'ERROR',
			});
		});

	return res.status(200).json({
		status: 'success',
		message:
			'Your request was received successfully. A notification will be sent to you with a download link.',
	});
});
