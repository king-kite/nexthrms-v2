import excelJS from 'exceljs';
import { parse } from 'json2csv';

import { permissions } from '../../../config';
import { getAssets } from '../../../db';
import { getRecords } from '../../../db/utils';
import { admin } from '../../../middlewares';
import { GetAssetsResponseType } from '../../../types';
import { hasModelPermission } from '../../../utils';
import { NextApiErrorMessage } from '../../../utils/classes';

export default admin().get(async (req, res) => {
	const hasExportPerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [permissions.asset.EXPORT]);

	if (!hasExportPerm) throw new NextApiErrorMessage(403);

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
			assetId: asset.assetId,
			condition: asset.condition,
			description: asset?.description,
			model: asset?.model,
			manufacturer: asset.manufacturer,
			name: asset.name,
			purchaseDate: asset.purchaseDate,
			purchaseFrom: asset.purchaseFrom,
			serialNo: asset.serialNo,
			status: asset.status,
			supplier: asset.supplier,
			warranty: asset.warranty,
			value: asset.value,
			userId: asset.user?.id,
		};
	});

	if (req.query.type === 'csv') {
		const data = parse(assets);

		res.setHeader('Content-Type', 'text/csv');
		res.setHeader('Content-Disposition', 'attachment; filename="assets.csv"');

		return res.status(200).end(data);
	} else {
		const workbook = new excelJS.Workbook(); // Create a new workbook
		const worksheet = workbook.addWorksheet('Assets'); // New Worksheet

		worksheet.columns = [
			{ header: 'ID', key: 'id', width: 10 },
			{ header: 'Asset ID', key: 'assetId', width: 10 },
			{ header: 'Condition', key: 'condition', width: 10 },
			{ header: 'Description', key: 'description', width: 10 },
			{ header: 'Model', key: 'model', width: 10 },
			{ header: 'Manufacturer', key: 'manufacturer', width: 10 },
			{ header: 'Name', key: 'name', width: 10 },
			{ header: 'Purchase Date', key: 'purchaseDate', width: 10 },
			{ header: 'Purchase From', key: 'purchaseFrom', width: 10 },
			{ header: 'Serial Number', key: 'serialNo', width: 10 },
			{ header: 'Status', key: 'status', width: 10 },
			{ header: 'Supplier', key: 'supplier', width: 10 },
			{ header: 'Warranty', key: 'warranty', width: 10 },
			{ header: 'Value', key: 'value', width: 10 },
			{ header: 'User ID', key: 'userId', width: 10 },
		];

		worksheet.addRows(assets);

		// Making first line in excel bold
		worksheet.getRow(1).eachCell((cell) => {
			cell.font = { bold: true };
		});

		res.setHeader(
			'Content-Type',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		);
		res.setHeader('Content-Disposition', 'attachment; filename="assets.xlsx"');

		return workbook.xlsx.write(res).then(function () {
			res.status(200).end();
		});
	}
});
