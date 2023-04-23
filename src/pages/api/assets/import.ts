import { permissions } from '../../../config';
import { prisma } from '../../../db';
import {
	createNotification,
	addObjectPermissions,
	updateObjectPermissions,
} from '../../../db/utils';
import { admin } from '../../../middlewares';
import { AssetImportQueryType, NextApiRequestExtendUser } from '../../../types';
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
		id: asset.id && asset.id.length > 0 ? asset.id : undefined,
		assetId: asset_id,
		purchaseDate: purchase_date ? new Date(purchase_date) : undefined,
		purchaseFrom: purchase_from,
		serialNo: serial_no,
		warranty: +asset.warranty,
		value: +asset.value,
		updatedAt: updated_at ? new Date(updated_at) : undefined,
		createdAt: created_at ? new Date(created_at) : undefined,
	};
}

async function createAssets(
	req: NextApiRequestExtendUser,
	data: AssetImportQueryType[]
) {
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
	} catch (error) {
		const err = handlePrismaErrors(error);
		createNotification({
			message:
				err.code === 400
					? process.env.NODE_ENV === 'development'
						? err.message
						: 'An error occurred. Probable cause: Incorrect Data Type'
					: err.message,
			recipient: req.user.id,
			title: 'Import Asset Data Error.',
		});
	}
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
		csvToJson(files.data.filepath, {
			headers,
		})
			.then(async (data: AssetImportQueryType[]) => createAssets(req, data))
			.catch((error: { status: number; data: string | unknown } | any) => {
				if (!error.status) throw error;
				const message =
					typeof error.data !== 'string'
						? process.env.NODE_ENV === 'development'
							? 'A server error occurred. Unable to import assets data from csv file. ' +
							  (error.data as any)?.message
							: 'A server error occurred. Unable to import assets data from csv file.'
						: error.data;
				createNotification({
					message,
					recipient: req.user.id,
					title: 'Import Asset Data Error.',
					type: 'ERROR',
				});
			});
	} else {
		excelToJson(files.data.filepath, {
			headers,
		})
			.then(async (data: AssetImportQueryType[]) => createAssets(req, data))
			.catch((error: { status: number; data: string | unknown } | any) => {
				if (!error.status) throw error;
				const message =
					typeof error.data !== 'string'
						? process.env.NODE_ENV === 'development'
							? 'A server error occurred. Unable to import assets data from excel file. ' +
							  (error.data as any)?.message
							: 'A server error occurred. Unable to import assets data from excel file.'
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
