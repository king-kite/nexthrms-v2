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
							is_user: true,
							name: user.email,
							object_id: perm.objectId,
							permission: perm.permission,
						});
					});
					perm.groups.forEach((group) => {
						data.push({
							is_user: false,
							name: group.name,
							object_id: perm.objectId,
							permission: perm.permission,
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
				worksheet.columns = Object.keys(assets).map((key) => ({
					header: key,
					key,
					width: 10,
				}));
				permissionWorksheet.columns = Object.keys(perms).map((key) => ({
					header: key,
					key,
					width: 10,
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

				workbook.xlsx
					.writeFile('media/exports/assets_csv.xlsx')
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
		console.log(error);
		createNotification({
			message: 'File exported poorly.',
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
