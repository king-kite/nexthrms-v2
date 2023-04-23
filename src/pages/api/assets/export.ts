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

	if (req.query.type === 'csv') {
		const data = parse(assets);

		res.setHeader('Content-Type', 'text/csv');
		res.setHeader('Content-Disposition', 'attachment; filename="assets.csv"');

		return res.status(200).end(data);
	} else {
		const workbook = new excelJS.Workbook(); // Create a new workbook
		const worksheet = workbook.addWorksheet('Assets'); // New Worksheet

		worksheet.columns = Object.keys(assets).map((key) => ({
			header: key,
			key,
			width: 10,
		}));

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
