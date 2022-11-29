import excelJS from 'exceljs';
import { parse } from 'json2csv';

import { getAssets } from '../../../db';
import { auth } from '../../../middlewares';
import { AssetType } from '../../../types';
import { validateParams } from '../../../validators';

export default auth().get(async (req, res) => {
	const params = validateParams(req.query);

	const data = await getAssets({ ...params });

	const assets = data.result.map((ast) => {
		const asset = ast as AssetType;
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
			userId: asset.user.id,
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
