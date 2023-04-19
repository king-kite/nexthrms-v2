import excelJS from 'exceljs';

import { permissions } from '../../../config';
import { prisma } from '../../../db';
import {
	createNotification,
	addObjectPermissions,
	updateObjectPermissions,
} from '../../../db/utils';
import { admin } from '../../../middlewares';
import { AssetImportQueryType } from '../../../types';
import { hasModelPermission } from '../../../utils';
import { NextApiErrorMessage } from '../../../utils/classes';
import { csvToJson } from '../../../utils/files';
import parseForm from '../../../utils/parseForm';

export const config = {
	api: {
		bodyParser: false,
	},
};

function getAssetInput({
	asset_id,
	purchase_date,
	purchase_from,
	serial_no,
	user,
	updated_at,
	created_at,
	...asset
}: AssetImportQueryType) {
	return {
		...asset,
		user: user
			? {
					connect: {
						email: user,
					},
			  }
			: undefined,
		assetId: asset_id,
		purchaseDate: purchase_date,
		purchaseFrom: purchase_from,
		serialNo: serial_no,
		updatedAt: updated_at,
		createdAt: created_at,
	};
}

export default admin().post(async (req, res) => {
	const hasExportPerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [permissions.asset.CREATE]);

	if (!hasExportPerm) throw new NextApiErrorMessage(403);

	const { files } = (await parseForm(req)) as { files: any };

	if (!files.data)
		throw new NextApiErrorMessage(400, 'Data field is required!');

	if (
		files.data.mimetype !== 'text/csv' &&
		files.data.mimetype !==
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
	)
		throw new NextApiErrorMessage(
			400,
			'Sorry, only CSVs and Microsoft excel files are allowed!'
		);

	if (files.data.mimetype === 'text/csv') {
		csvToJson<AssetImportQueryType>(files.data.filepath, {
			headers: [
				'id',
				'asset_id',
				'condition',
				'description',
				'model',
				'manufacturer',
				'name',
				'purchase_date',
				'purchase_from',
				'serial_no',
				'status',
				'supplier',
				'warranty',
				'value',
				'user',
				'updated_at',
				'created_at',
			],
		})
			.then(async (data) => {
				const input = data.map(getAssetInput);
				const result = await prisma.$transaction(
					input.map((data) =>
						prisma.asset.create({
							data,
							select: {
								id: true,
								user: {
									select: {
										id: true,
									},
								},
							},
						})
					)
				);
				await Promise.all(
					result.map((asset) =>
						addObjectPermissions({
							model: 'assets',
							objectId: asset.id,
							users: [req.user.id],
						})
					)
				);
				await Promise.all(
					result.reduce((acc: Promise<any>[], asset) => {
						if (!asset.user || asset.user.id !== req.user.id) return acc;
						return [
							...acc,
							updateObjectPermissions({
								model: 'assets',
								objectId: asset.id,
								permissions: ['VIEW'],
								users: [asset.user.id],
							}),
						];
					}, [])
				);
				createNotification({
					message: 'Assets data was imported successfully.',
					recipient: req.user.id,
					title: 'Import Asset Data Success.',
				});
			})
			.catch((error: { status: number; data: string | unknown } | any) => {
				if (!error.status) throw error;
				const message =
					typeof error.data !== 'string'
						? process.env.NODE_ENV === 'development'
							? 'A server error occurred. Unable to import assets data. ' +
							  (error.data as any)?.message
							: 'A server error occurred. Unable to import assets data.'
						: error.data;
				createNotification({
					message,
					recipient: req.user.id,
					title: 'Import Asset Data Error.',
					type: 'ERROR',
				});
			});
	}

	return res.status(200).json({
		status: 'success',
		message:
			'Import file was received successfully. ' +
			'A notification will be sent to you when the task is completed',
	});
});
