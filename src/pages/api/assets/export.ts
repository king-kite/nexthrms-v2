import excelJS from 'exceljs';
import { parse } from 'json2csv';
import JSZip from 'jszip';

import { permissions } from '../../../config';
import { getAssets, prisma } from '../../../db';
import { createNotification, getRecords } from '../../../db/utils';
import { admin } from '../../../middlewares';
import {
	GetAssetsResponseType,
	NextApiRequestExtendUser,
} from '../../../types';
import { hasModelPermission } from '../../../utils';
import { NextApiErrorMessage } from '../../../utils/classes';
import { uploadBuffer } from '../../../utils/files';

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
];

const permissionHeaders = ['name', 'object_id', 'permission', 'is_user'];

function exportData(req: NextApiRequestExtendUser) {
	return new Promise(async (resolve, reject) => {
		try {
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
				};
			});

			const objectPermissions = await prisma.permissionObject.findMany({
				where: {
					modelName: 'assets',
					objectId: {
						in: assets.map((asset) => asset.id),
					},
				},
				include: {
					groups: {
						select: {
							name: true,
						},
					},
					users: {
						select: {
							email: true,
						},
					},
				},
			});

			const perms = objectPermissions.reduce(
				(
					acc: {
						is_user: boolean;
						name: string;
						object_id: string;
						permission: 'DELETE' | 'EDIT' | 'VIEW';
					}[],
					perm
				) => {
					const data: {
						is_user: boolean;
						name: string;
						object_id: string;
						permission: 'DELETE' | 'EDIT' | 'VIEW';
					}[] = [];
					perm.users.forEach((user) => {
						data.push({
							name: user.email,
							object_id: perm.objectId,
							permission: perm.permission,
							is_user: true,
						});
					});
					perm.groups.forEach((group) => {
						data.push({
							name: group.name,
							object_id: perm.objectId,
							permission: perm.permission,
							is_user: false,
						});
					});

					return [...acc, ...data];
				},
				[]
			);

			if (req.query.type === 'csv') {
				const data = parse(assets);
				const permissions = parse(perms);

				const zip = new JSZip();

				zip.file('assets.csv', data);
				zip.file('permissions.csv', permissions);

				const buffer = Buffer.from(
					await zip.generateAsync({ type: 'arraybuffer' })
				);

				uploadBuffer({
					buffer,
					location: 'media/exports/assets_csv.zip',
					name: 'assets_csv.zip',
				})
					.then(() => {
						return createNotification({
							message:
								'File exported successfully. Click on the download link to proceed!',
							recipient: req.user.id,
							title: 'Assets Data Export Success',
							type: 'SUCCESS',
						});
					})
					.then(() => {
						resolve(undefined);
					})
					.catch((error) => {
						reject(error);
					});
			} else {
				const workbook = new excelJS.Workbook(); // Create a new workbook

				const worksheet = workbook.addWorksheet('Assets'); // New Worksheet
				const permissionWorksheet = workbook.addWorksheet('Permissions'); // New Permission Worksheet

				// Add the headers
				worksheet.columns = headers.map((key) => ({
					header: key,
					key,
				}));
				permissionWorksheet.columns = permissionHeaders.map((key) => ({
					header: key,
					key,
				}));

				// Add the data/content
				worksheet.addRows(assets);
				permissionWorksheet.addRows(perms);

				// Making first line in excel bold
				worksheet.getRow(1).eachCell((cell) => {
					cell.font = { bold: true };
				});
				permissionWorksheet.getRow(1).eachCell((cell) => {
					cell.font = { bold: true };
				});

				const buffer = Buffer.from(await workbook.xlsx.writeBuffer());

				uploadBuffer({
					buffer,
					location: 'media/exports/assets_excel.xlsx',
					name: 'assets_excel.xlsx',
				})
					.then(() => {
						return createNotification({
							message:
								'File exported successfully. Click on the download link to proceed!',
							recipient: req.user.id,
							title: 'Assets Data Export Success',
							type: 'SUCCESS',
						});
					})
					.then(() => {
						resolve(undefined);
					})
					.catch((error) => {
						reject(error);
					});
			}
		} catch (error) {
			reject(error);
		}
	});
}

export default admin().get(async (req, res) => {
	const hasExportPerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [permissions.asset.EXPORT]);

	if (!hasExportPerm) throw new NextApiErrorMessage(403);

	exportData(req).catch((error) => {
		const message =
			typeof error.data !== 'string'
				? process.env.NODE_ENV === 'development'
					? 'A server error occurred. Unable to export assets. ' +
					  (error.data as any)?.message
					: 'A server error occurred. Unable to import assets.'
				: error.data;
		createNotification({
			message,
			recipient: req.user.id,
			title: 'Assets Data Export Failed',
			type: 'ERROR',
		});
	});

	return res.status(200).json({
		status: 'success',
		message:
			'Your request was received successfully. A notification will be sent to you with a download link.',
	});
});
