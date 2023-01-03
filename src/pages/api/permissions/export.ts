import excelJS from 'exceljs';
import { parse } from 'json2csv';

import { getPermissions } from '../../../db';
import { auth } from '../../../middlewares';
import { PermissionType } from '../../../types';
import { validateParams } from '../../../validators';

export default auth().get(async (req, res) => {
	const params = validateParams(req.query);

	const data = await getPermissions(params);

	const permissions = data.result.map((perm) => {
		const permission = perm as PermissionType;
		return {
			id: permission.id,
			name: permission.name,
			codename: permission.codename,
			descrption: permission.description || null,
			category: permission.category ? permission.category.name : null,
		};
	});

	if (req.query.type === 'csv') {
		const data = parse(permissions);

		res.setHeader('Content-Type', 'text/csv');
		res.setHeader(
			'Content-Disposition',
			'attachment; filename="permissions.csv"'
		);

		return res.status(200).end(data);
	} else {
		const workbook = new excelJS.Workbook(); // Create a new workbook
		const worksheet = workbook.addWorksheet('Permissions'); // New Worksheet

		worksheet.columns = [
			{ header: 'ID', key: 'id', width: 10 },
			{ header: 'Name', key: 'name', width: 10 },
			{ header: 'Code Name', key: 'codename', width: 10 },
			{ header: 'Description', key: 'description', width: 10 },
			{ header: 'Category', key: 'category', width: 10 },
		];

		worksheet.addRows(permissions);

		// Making first line in excel bold
		worksheet.getRow(1).eachCell((cell) => {
			cell.font = { bold: true };
		});

		res.setHeader(
			'Content-Type',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		);
		res.setHeader(
			'Content-Disposition',
			'attachment; filename="permissions.xlsx"'
		);

		return workbook.xlsx.write(res).then(function () {
			res.status(200).end();
		});
	}
});
