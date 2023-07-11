import { groupHeaders as headers, permissions } from '../../../config';
import { getGroups } from '../../../db/queries/groups';
import {
	createNotification,
	exportData,
	getObjectPermissionExportData,
	getRecords,
} from '../../../db/utils';
import { admin } from '../../../middlewares';
import { NextApiRequestExtendUser, GroupType } from '../../../types';
import { hasModelPermission } from '../../../utils/permission';
import { NextErrorMessage } from '../../../utils/classes';
import { handlePrismaErrors } from '../../../validators';

async function getGroupsData(req: NextApiRequestExtendUser) {
	const placeholder: {
		total: number;
		result: GroupType[];
	} = {
		total: 0,
		result: [],
	};

	const result = await getRecords<{
		total: number;
		result: GroupType[];
	}>({
		model: 'groups',
		perm: 'group',
		query: req.query,
		user: req.user,
		placeholder,
		getData(params) {
			return getGroups(params);
		},
	});

	const data = result ? result.data : placeholder;

	const groups = data.result.map((group) => ({
		id: group.id,
		name: group.name,
		description: group.description,
		permissions: group.permissions.map((perm) => perm.codename).join(','),
		active: group.active,
	}));

	const perms = await getObjectPermissionExportData({
		ids: groups.map((group) => group.id),
		model: 'groups',
	});

	return {
		data: groups,
		permissions: perms,
	};
}

export default admin().get(async (req, res) => {
	const hasExportPerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [permissions.group.EXPORT]);

	if (!hasExportPerm) throw new NextErrorMessage(403);

	getGroupsData(req)
		.then((data) => {
			return exportData(data, headers, {
				title: 'groups',
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
				title: 'Groups data export was successful.',
				type: 'DOWNLOAD',
			});
		})
		.catch((err) => {
			const error = handlePrismaErrors(err);
			createNotification({
				message: error.message,
				recipient: req.user.id,
				title: 'Groups data export failed.',
				type: 'ERROR',
			});
		});

	return res.status(200).json({
		status: 'success',
		message:
			'Your request was received successfully. A notification will be sent to you with a download link.',
	});
});
