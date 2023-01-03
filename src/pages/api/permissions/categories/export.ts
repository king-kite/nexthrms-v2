import excelJS from 'exceljs';
import { parse } from 'json2csv';

import { getPermissionCategories } from '../../../../db';
import { auth } from '../../../../middlewares';
import { PermissionCategoryType } from '../../../../types';
import { validateParams } from '../../../../validators';

export default auth().get(async (req, res) => {
	const params = validateParams(req.query);

	const data = await getPermissionCategories(params);

	const categories = data.result.map((cat) => {
		const category = cat as PermissionCategoryType;
		return {
			id: category.id,
			name: category.name,
		};
	});

	if (req.query.type === 'csv') {
		const data = parse(categories);

		res.setHeader('Content-Type', 'text/csv');
		res.setHeader(
			'Content-Disposition',
			'attachment; filename="permission categories.csv"'
		);

		return res.status(200).end(data);
	} else {
		const workbook = new excelJS.Workbook(); // Create a new workbook
		const worksheet = workbook.addWorksheet('Permission Categories'); // New Worksheet

		worksheet.columns = [
			{ header: 'ID', key: 'id', width: 10 },
			{ header: 'Name', key: 'name', width: 10 },
		];

		worksheet.addRows(categories);

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
			'attachment; filename="permission categories.xlsx"'
		);

		return workbook.xlsx.write(res).then(function () {
			res.status(200).end();
		});
	}
});
