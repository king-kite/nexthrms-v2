import { AssetCondition, AssetStatus, Prisma } from '@prisma/client';

import { assetHeaders as headers, permissions } from '../../../config';
import { prisma } from '../../../db';
import {
	addObjectPermissions,
	createNotification,
	handleNotificationErrors as handleErrors,
	importData,
	importPermissions,
	updateObjectPermissions,
} from '../../../db/utils';
import { admin } from '../../../middlewares';
import { AssetImportQueryType, NextApiRequestExtendUser } from '../../../types';
import { hasModelPermission } from '../../../utils';
import { NextApiErrorMessage } from '../../../utils/classes';
import parseForm from '../../../utils/parseForm';
import { ObjectPermissionImportType } from '../../../types';

export const config = {
	api: {
		bodyParser: false,
	},
};

function getAssetInput(asset: AssetImportQueryType): Prisma.AssetCreateInput {
	return {
		user: asset.user
			? {
					connect: {
						email: asset.user,
					},
			  }
			: undefined,
		id: asset.id && asset.id.length > 0 ? asset.id : undefined,
		assetId: asset.asset_id.toString(),
		condition: asset.condition.toString() as AssetCondition,
		description: asset.description ? asset.description.toString() : undefined,
		manufacturer: asset.manufacturer.toString(),
		model: asset.model ? asset.model.toString() : undefined,
		name: asset.name.toString(),
		purchaseDate: asset.purchase_date
			? new Date(asset.purchase_date)
			: undefined,
		purchaseFrom: asset.purchase_from.toString(),
		serialNo: asset.serial_no.toString(),
		status: asset.status.toString() as AssetStatus,
		supplier: asset.supplier.toString(),
		warranty: +asset.warranty,
		value: +asset.value,
		updatedAt: asset.updated_at ? new Date(asset.updated_at) : new Date(),
		createdAt: asset.created_at ? new Date(asset.created_at) : new Date(),
	};
}

function createAssets(
	req: NextApiRequestExtendUser,
	data: AssetImportQueryType[],
	perms?: ObjectPermissionImportType[]
) {
	return new Promise<
		{
			id: string;
			user: {
				id: string;
			} | null;
		}[]
	>(async (resolve, reject) => {
		try {
			const input = data.map(getAssetInput);
			// check that every asset input has an ID.
			const invalid = input.filter((asset) => !asset.id);
			if (invalid.length > 0) {
				return reject({
					data: {
						message:
							`An id field is required to avoid duplicate records. The following records do not have an id: ` +
							input.map((asset) => asset.name).join(','),
						title: 'ID field is required.',
					},
					status: 400,
				});
			}
			const result = await prisma.$transaction(
				input.map((data) =>
					prisma.asset.upsert({
						where: { id: data.id },
						update: data,
						create: data,
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

			// Asset users can view their assets
			await Promise.all(
				result.reduce((acc: Promise<any>[], asset) => {
					if (!asset.user || asset.user.id === req.user.id) return acc;
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
			if (perms) await importPermissions(perms);
			resolve(result);
		} catch (error) {
			reject(error);
		}
	});
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
		files.data.mimetype !== 'application/zip' &&
		files.data.mimetype !==
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
	)
		throw new NextApiErrorMessage(
			400,
			'Sorry, only CSVs, Microsoft excel files and Zip files are allowed!'
		);

	importData<AssetImportQueryType>({
		headers,
		path: files.data.filepath,
		type: files.data.mimetype,
		zipName: 'assets.csv',
	})
		.then((result) => createAssets(req, result.data, result.permissions))
		.then(() =>
			createNotification({
				message: 'Assets data was imported successfully.',
				recipient: req.user.id,
				title: 'Import Asset Data Success.',
				type: 'SUCCESS',
			})
		)
		.catch((error) =>
			handleErrors(error, {
				recipient: req.user.id,
				title: 'Import Asset Data Error',
			})
		);

	return res.status(200).json({
		status: 'success',
		message:
			'Import file was received successfully. ' +
			'A notification will be sent to you when the task is completed',
	});
});
