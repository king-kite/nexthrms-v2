import { clientHeaders as headers, permissions } from '../../../config';
import { getClients } from '../../../db';
import {
	createNotification,
	exportData,
	getObjectPermissionExportData,
	getRecords,
} from '../../../db/utils';
import { admin } from '../../../middlewares';
import {
	GetClientsResponseType,
	NextApiRequestExtendUser,
} from '../../../types';
import { hasModelPermission } from '../../../utils';
import { NextApiErrorMessage } from '../../../utils/classes';
import { handlePrismaErrors } from '../../../validators';

// Get the records from the database, including the permissions
async function getData(req: NextApiRequestExtendUser) {
	const placeholder: GetClientsResponseType['data'] = {
		active: 0,
		inactive: 0,
		total: 0,
		result: [],
	};

	const result = await getRecords<GetClientsResponseType['data']>({
		model: 'clients',
		perm: 'client',
		query: req.query,
		user: req.user,
		placeholder,
		getData(params) {
			return getClients(params);
		},
	});

	const data = result ? result.data : placeholder;

	const values = data.result.map((client) => {
		return {
			id: client.id,
			company: client.company,
			position: client.position,
			contact_id: client.contact.id,
			updated_at: client.updatedAt,
			created_at: client.createdAt,
		};
	});

	const perms = await getObjectPermissionExportData({
		ids: values.map((value) => value.id),
		model: 'clients',
	});

	return {
		data: values,
		permissions: perms,
	};
}

export default admin().get(async (req, res) => {
	const hasExportPerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [permissions.client.EXPORT]);

	if (!hasExportPerm) throw new NextApiErrorMessage(403);

	getData(req)
		.then((data) => {
			return exportData(data, headers, {
				title: 'Clients',
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
				title: 'Clients data export was successful.',
				type: 'DOWNLOAD',
			});
		})
		.catch((err) => {
			const error = handlePrismaErrors(err);
			createNotification({
				message: error.message,
				recipient: req.user.id,
				title: 'Clients data export failed.',
				type: 'ERROR',
			});
		});

	return res.status(200).json({
		status: 'success',
		message:
			'Your request was received successfully. A notification will be sent to you with a download link.',
	});
});
