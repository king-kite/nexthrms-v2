import { assetHeaders as headers, permissions } from '../../../config';
import { getAssets } from '../../../db';
import {
	createNotification,
	exportData,
	getObjectPermissionExportData,
	getRecords,
} from '../../../db/utils';
import { admin } from '../../../middlewares';
import {
	GetAssetsResponseType,
	NextApiRequestExtendUser,
} from '../../../types';
import { hasModelPermission } from '../../../utils';
import { NextApiErrorMessage } from '../../../utils/classes';
import { handlePrismaErrors } from '../../../validators';

// Get the records from the database, including the permissions
async function getAssetsData(req: NextApiRequestExtendUser) {
	const placeholder: GetAssetsResponseType['data'] = {
		total: 0,
		result: [],
	};

	const result = await getRecords<GetAssetsResponseType['data']>({
		model: 'assets',
		perm: 'asset',
		query: req.query,
		user: req.user,
		placeholder,
		getData(params) {
			return getAssets(params);
		},
	});

	const data = result ? result.data : placeholder;

	const assets = data.result.map((asset) => {
		return {
			id: asset.id,
			asset_id: asset.assetId,
			condition: asset.condition,
			description: asset?.description,
			model: asset?.model,
			manufacturer: asset.manufacturer,
			name: asset.name,
			purchase_date: asset.purchaseDate,
			purchase_from: asset.purchaseFrom,
			serial_no: asset.serialNo,
			status: asset.status,
			supplier: asset.supplier,
			warranty: asset.warranty,
			value: asset.value,
			user: asset.user?.email,
			updated_at: asset.updatedAt,
			created_at: asset.createdAt,
		};
	});

	const perms = await getObjectPermissionExportData({
		ids: assets.map((asset) => asset.id),
		model: 'assets',
	});

	return {
		data: assets,
		permissions: perms,
	};
}

export default admin().get(async (req, res) => {
	const hasExportPerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [permissions.asset.EXPORT]);

	if (!hasExportPerm) throw new NextApiErrorMessage(403);

	getAssetsData(req)
		.then((data) => {
			return exportData(data, headers, {
				title: 'Assets',
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
				title: 'Assets data export was successful.',
				type: 'DOWNLOAD',
			});
		})
		.catch((err) => {
			const error = handlePrismaErrors(err);
			createNotification({
				message: error.message,
				recipient: req.user.id,
				title: 'Assets data export failed.',
				type: 'ERROR',
			});
		});

	return res.status(200).json({
		status: 'success',
		message:
			'Your request was received successfully. A notification will be sent to you with a download link.',
	});
});
