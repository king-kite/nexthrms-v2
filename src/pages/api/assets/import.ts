import { AssetCondition, AssetStatus, Prisma } from '@prisma/client';
import fs from 'fs';
import JSZip from 'jszip';

import { permissions } from '../../../config';
import { prisma } from '../../../db';
import {
	createNotification,
	addObjectPermissions,
	exportPermissionHeaders as permissionHeaders,
	updateObjectPermissions,
} from '../../../db/utils';
import { admin } from '../../../middlewares';
import {
	AssetImportQueryType,
	NextApiRequestExtendUser,
	ObjectPermissionImportType,
} from '../../../types';
import { hasModelPermission } from '../../../utils';
import { NextApiErrorMessage } from '../../../utils/classes';
import { csvToJson, excelToJson } from '../../../utils/files';
import parseForm from '../../../utils/parseForm';
import { handlePrismaErrors } from '../../../validators';

export const config = {
	api: {
		bodyParser: false,
	},
};

const headers = [
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
];

function handleErrors(
	userId: string,
	error: { status: number; data: string | unknown } | any
) {
	let message = '';
	if (error.status) {
		message =
			typeof error.data !== 'string'
				? process.env.NODE_ENV === 'development'
					? 'A server error occurred. Unable to import assets data from excel file. ' +
					  (error.data as any)?.message
					: 'A server error occurred. Unable to import assets data from excel file.'
				: error.data;
	} else {
		const err = handlePrismaErrors(error);
		message = err.message;
	}
	createNotification({
		message,
		recipient: userId,
		title: 'Import Asset Data Error.',
		type: 'ERROR',
	});
}

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

function getObjectPermissionInput(objPerm: ObjectPermissionImportType) {
	return {
		modelName: objPerm.model_name,
		objectId: objPerm.object_id,
		permission: objPerm.permission,
		users: objPerm.is_user
			? {
					connect: {
						email: objPerm.name,
					},
			  }
			: undefined,
		groups: !objPerm.is_user
			? {
					connect: {
						name: objPerm.name,
					},
			  }
			: undefined,
	};
}

function createAssets(
	req: NextApiRequestExtendUser,
	data: AssetImportQueryType[]
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
			const result = await prisma.$transaction(
				input.map((data) =>
					data.id
						? prisma.asset.upsert({
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
						: prisma.asset.create({
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
			resolve(result);
		} catch (error) {
			reject(error);
		}
	});
}

function updateAssetsPermissions(
	req: NextApiRequestExtendUser,
	data: ObjectPermissionImportType[]
) {
	return new Promise<
		{
			id: string;
		}[]
	>(async (resolve, reject) => {
		try {
			const input = data.map(getObjectPermissionInput);
			const result = await prisma.$transaction(
				input.map((data) =>
					prisma.permissionObject.upsert({
						where: {
							modelName_objectId_permission: {
								modelName: data.modelName,
								objectId: data.objectId,
								permission: data.permission,
							},
						},
						update: data,
						create: data,
						select: { id: true },
					})
				)
			);
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

	try {
		if (files.data.mimetype === 'application/zip') {
			fs.readFile(files.data.filepath, async function (err, data) {
				if (err) throw err;
				const zipFile = await JSZip.loadAsync(data);
				const assets = await zipFile.file('assets.csv')?.async('string');
				if (!assets) {
					return res.status(400).json({
						status: 'error',
						message: 'zip file does not contain the assets.csv file.',
					});
				}
				const permissions = await zipFile
					.file('permissions.csv')
					?.async('string');
				if (!permissions) {
					return res.status(400).json({
						status: 'error',
						message: 'zip file does not contain the permissions.csv file.',
					});
				}
				csvToJson(assets, {
					headers,
					isPath: false,
				})
					.then((data: AssetImportQueryType[]) => createAssets(req, data))
					.then(() =>
						csvToJson(permissions, {
							headers: permissionHeaders,
							isPath: false,
						})
					)
					.then((data: ObjectPermissionImportType[]) =>
						updateAssetsPermissions(req, data)
					)
					.then(() =>
						createNotification({
							message: 'Assets data was imported successfully.',
							recipient: req.user.id,
							title: 'Import Asset Data Success.',
							type: 'SUCCESS',
						})
					)
					.catch((error) => handleErrors(req.user.id, error));
			});
		} else if (files.data.mimetype === 'text/csv') {
			csvToJson(files.data.filepath, {
				headers,
			})
				.then((data: AssetImportQueryType[]) => createAssets(req, data))
				.then(() =>
					createNotification({
						message: 'Assets data was imported successfully.',
						recipient: req.user.id,
						title: 'Import Asset Data Success.',
						type: 'SUCCESS',
					})
				)
				.catch((error) => handleErrors(req.user.id, error));
		} else {
			excelToJson(files.data.filepath, {
				headers,
			})
				.then((data: AssetImportQueryType[]) => createAssets(req, data))
				.then(() =>
					createNotification({
						message: 'Assets data was imported successfully.',
						recipient: req.user.id,
						title: 'Import Asset Data Success.',
						type: 'SUCCESS',
					})
				)
				.catch((error) => handleErrors(req.user.id, error));
		}
	} catch (error) {
		handleErrors(req.user.id, error);
	}

	return res.status(200).json({
		status: 'success',
		message:
			'Import file was received successfully. ' +
			'A notification will be sent to you when the task is completed',
	});
});
